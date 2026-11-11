import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { normalizeSheetAppearance } from '@/character/appearance/theme'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.resetModules()
})
describe('legacy browser state compatibility', () => {
  it('creates unique card IDs with secure random bytes when randomUUID is absent', async () => {
    vi.stubGlobal('crypto', { getRandomValues: crypto.getRandomValues.bind(crypto) })
    vi.resetModules()
    const { createRandomCardInstanceId } = await import('@/automation/actions/card-actions')
    const first = createRandomCardInstanceId(),
      second = createRandomCardInstanceId()
    expect(first).toMatch(/^cardinst_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    expect(first).not.toBe(second)
  })
  it('validates saved profession themes without Object.hasOwn', () => {
    vi.spyOn(Object, 'hasOwn').mockImplementation(() => {
      throw new Error('Unsupported API')
    })
    expect(normalizeSheetAppearance({ mode: 'profession', profession: 'warrior' }).profession).toBe('warrior')
    expect(normalizeSheetAppearance({ profession: 'constructor' }).profession).toBe('bard')
  })
  it('projects independent sheet copies without native structuredClone and rejects non-cloneable data', async () => {
    vi.stubGlobal('structuredClone', undefined)
    vi.resetModules()
    const { projectSheetForStorage } = await import('@/character/storage/sheet-image-projection')
    const source = { ...defaultSheetData, inventory: ['书'], characterBackground: undefined }
    const result = await projectSheetForStorage('test', source)
    expect(result.storedSheet.inventory).toEqual(['书'])
    expect(result.storedSheet).toHaveProperty('characterBackground', undefined)
    expect(result.storedSheet.inventory).not.toBe(source.inventory)
    expect(result.runtimeSheet.inventory).not.toBe(result.storedSheet.inventory)
    await expect(
      projectSheetForStorage('test', { ...source, name: (() => {}) as unknown as string }),
    ).rejects.toThrow()
    expect(source.inventory).toEqual(['书'])
  })
})
