import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAllCharacterImages } from '@/character/storage/character-image-repository'
import {
  prepareSheetForExport,
  projectSheetForStorage,
} from '@/character/storage/sheet-image-projection'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { getHTMLContent } from '@/lib/html-exporter'
import { extractCharacterDataFromHTML } from '@/lib/html-importer'
import type { SheetData } from '@/lib/sheet-data'
import { exportCharacterData } from '@/lib/storage'

const png = 'data:image/png;base64,aGVsbG8='

function sheet(overrides: Partial<SheetData> = {}): SheetData {
  return {
    ...structuredClone(defaultSheetData),
    name: 'Export Hero',
    ...overrides,
  }
}

describe('character export image preparation', () => {
  beforeEach(async () => {
    vi.stubGlobal('fetch', async (input: RequestInfo | URL) => {
      const dataUrl = String(input)
      const [metadata, base64] = dataUrl.split(',')
      const mimeType = metadata.match(/^data:([^;]+)/)?.[1] ?? ''

      return {
        blob: async () => new NodeBlob([Buffer.from(base64, 'base64')], { type: mimeType }),
      }
    })

    await clearAllCharacterImages()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  it('prepareSheetForExport restores base64 and strips imageAssets', async () => {
    const projected = await projectSheetForStorage('export-id', sheet({
      characterImage: png,
    }))

    const exported = await prepareSheetForExport(projected.storedSheet)

    expect(exported.characterImage).toMatch(/^data:image\/png;base64,/)
    expect((exported as { imageAssets?: unknown }).imageAssets).toBeUndefined()
  })

  it('JSON export downloads portable sheet data', async () => {
    const projected = await projectSheetForStorage('export-id', sheet({
      characterImage: png,
    }))
    const anchor = document.createElement('a')
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(anchor, 'click').mockImplementation(() => undefined)
    vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'a') return anchor
      return originalCreateElement(tagName, options)
    })

    let downloaded!: Blob
    vi.spyOn(URL, 'createObjectURL').mockImplementation(blob => {
      downloaded = blob as Blob
      return 'blob:json-file'
    })
    await exportCharacterData(projected.storedSheet)
    expect(anchor.href).toBe('blob:json-file')
    const payload = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsText(downloaded)
    })
    expect(payload).toContain('data:image/png;base64')
    expect(payload).not.toContain('imageAssets')
  })

  it('HTML content embeds portable sheet data', async () => {
    const projected = await projectSheetForStorage('export-id', sheet({
      characterImage: png,
    }))
    document.body.innerHTML = '<div class="print-all-pages"><div>sheet preview</div></div>'

    const html = await getHTMLContent(projected.storedSheet, { includeStyles: false })
    const embeddedPayload = html.match(/window\.characterData = ([\s\S]*?);\s*function printCharacterSheet/)?.[1]

    expect(embeddedPayload).toBeDefined()
    const embeddedData = JSON.parse(embeddedPayload ?? '{}') as SheetData
    expect(embeddedData.characterImage).toMatch(/^data:image\/png;base64,/)
    expect((embeddedData as { imageAssets?: unknown }).imageAssets).toBeUndefined()
  })

  it('preserves PNG ribbon bytes in standalone HTML even when the browser can encode WebP', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(['original-ribbon'], { type: 'image/png' }),
    }))
    const transcode = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/webp;base64,not-the-original')
    document.body.innerHTML = '<div class="print-all-pages"><img data-domain-ribbon src="/domain-labels/grace.png" alt=""></div>'
    const image = document.querySelector('img')!
    Object.defineProperties(image, { complete: { value: true }, naturalWidth: { value: 160 }, naturalHeight: { value: 253 } })
    const html = await getHTMLContent(sheet(), { includeStyles: false })
    const exported = new DOMParser().parseFromString(html, 'text/html')
    expect(exported.querySelector('img')?.src).toMatch(/^data:image\/png;base64,/)
    expect(transcode).not.toHaveBeenCalled()
  })

  it('embeds distinct images with the same basename, reuses duplicates and removes responsive URLs', async () => {
    const fetchImage = vi.fn(async (url: string) => ({
      ok: true, blob: async () => new Blob([url], { type: 'image/png' }),
    }))
    vi.stubGlobal('fetch', fetchImage)
    document.body.innerHTML = '<div class="print-all-pages"><p>localStorage 和 useState() 是角色的笔记</p><img data-domain-ribbon src="/a/x.png"><img data-domain-ribbon src="/b/x.png" srcset="/b/x.png 1x"><img data-domain-ribbon src="/a/x.png"></div>'
    document.querySelectorAll('img').forEach(img => Object.defineProperties(img, {
      complete: { value: true }, naturalWidth: { value: 1 },
    }))
    const html = await getHTMLContent(sheet(), { includeStyles: false })
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    const [a, b, repeat] = Array.from(parsed.querySelectorAll('img'))
    expect(a.src).not.toBe(b.src)
    expect(repeat.src).toBe(a.src)
    expect(b.hasAttribute('srcset')).toBe(false)
    expect(fetchImage).toHaveBeenCalledTimes(2)
    expect(parsed.querySelector('p')?.textContent).toContain('localStorage 和 useState()')
  })

  it('round trips free text with markup and the legacy JSON terminator', async () => {
    document.body.innerHTML = '<div class="print-all-pages"></div>'
    const name = '笔记 }; 与 </script> 标签'
    const html = await getHTMLContent(sheet({ name }), { includeStyles: false })
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    expect(parsed.querySelector('script')?.textContent).toContain('function printCharacterSheet')
    expect(extractCharacterDataFromHTML(html).data?.name).toBe(name)
  })

  it('keeps print-only resource values while removing ordinary hidden controls without changing the live sheet', async () => {
    document.body.innerHTML = `<div class="print-all-pages">
      <span class="resource-print-value hidden print:inline">上限 6</span>
      <div class="ordinary-hidden-control hidden">hidden control</div>
    </div>`
    const html = await getHTMLContent(sheet(), { includeStyles: false })
    const exported = new DOMParser().parseFromString(html, 'text/html')
    expect(exported.querySelector('.resource-print-value')?.textContent).toBe('上限 6')
    expect(exported.querySelector('.resource-print-value')?.classList.contains('hidden')).toBe(false)
    expect(exported.querySelector('.ordinary-hidden-control')).toBeNull()
    expect(document.querySelector('.resource-print-value')?.classList.contains('hidden')).toBe(true)
  })

  it('preserves paragraph breaks in editable story answers and continuation notes', async () => {
    document.body.innerHTML = '<div class="print-all-pages"><div class="reference-field">第一段\n\n第二段</div><section class="reference-continuation"><p>补充记录\n结尾</p></section></div>'
    const html = await getHTMLContent(sheet(), { includeStyles: false })
    const exported = new DOMParser().parseFromString(html, 'text/html')
    expect(exported.querySelector('.reference-field')?.textContent).toBe('第一段\n\n第二段')
    expect(exported.querySelector('.reference-continuation p')?.textContent).toBe('补充记录\n结尾')
  })
})

describe('offline reader metadata', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals() })
  it('identifies the reference layout and carries the same reimportable character data', async () => {
    document.body.innerHTML = '<div class="print-all-pages"><section class="reference-sheet"><div class="reference-character-portrait">portrait</div></section></div>'
    const data = sheet({ name: '新版角色', cards: [] })
    const html = await getHTMLContent(data, { includeStyles: false })
    const exported = new DOMParser().parseFromString(html, 'text/html')
    expect(exported.documentElement.dataset.layout).toBe('reference')
    expect(exported.documentElement.dataset.version).toBe('2.0')
    expect(exported.querySelector('.reference-character-portrait')).not.toBeNull()
    expect(html).toContain('window.characterData = ')
    const imported = extractCharacterDataFromHTML(html)
    expect(imported.success).toBe(true)
    expect(imported.data?.name).toBe('新版角色')
  })
})
