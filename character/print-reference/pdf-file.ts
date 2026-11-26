import html2canvas from 'html2canvas-pro'
import { jsPDF } from 'jspdf'
import { embeddedStyles } from '@/lib/embedded-styles'
import { preparePrintDocument, type PDFPrintMode } from './print-document'

import { waitForPrintImages } from './print-images'

const PAGE_WIDTH = 210
const PAGE_HEIGHT = 297
const PIXELS_PER_MM = 96 / 25.4
const BODY_HEIGHT = Math.ceil(PAGE_HEIGHT * PIXELS_PER_MM)
const VIEWPORT_WIDTH = 1200

function activatePrintStyles(css: string): string {
  return css.replace(/@media\s+print\b/g, '@media all')
    .replace(/@media\s+screen[^{}]*(?=\{)/g, '@media not all ')
}

function sourcePages(sheet: HTMLElement): HTMLElement[] {
  return Array.from(sheet.children).flatMap(child => {
    const section = child as HTMLElement
    const pages = Array.from(section.querySelectorAll<HTMLElement>(
      '.printed-card-sheet, .beast-forms-print-sheets > .beast-form-sheet',
    ))
    return pages.length ? pages : [section]
  })
}

/** Render one A4 canvas at a time to stay within mobile canvas limits. */
export async function createSheetPDFFile(
  mode: PDFPrintMode,
  name: string,
  onProgress: (page: number) => void,
): Promise<Blob> {
  await preparePrintDocument(mode)
  const sheet = document.querySelector<HTMLElement>('.print-pages-scroll-content > .sheet-appearance')
  if (!sheet) throw new Error('未找到角色卡预览。')

  const iframe = document.createElement('iframe')
  iframe.title = 'PDF 排版'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.tabIndex = -1
  iframe.style.cssText = `position:fixed;left:-${VIEWPORT_WIDTH + 10}px;top:0;width:${VIEWPORT_WIDTH}px;height:1123px;border:0;pointer-events:none`
  document.body.appendChild(iframe)
  try {
    const doc = iframe.contentDocument
    if (!doc?.body) throw new Error('浏览器无法打开 PDF 排版页面。')
    doc.documentElement.lang = 'zh-CN'
    const style = doc.createElement('style')
    const inlineCss = Array.from(sheet.querySelectorAll('style'), element => element.textContent).join('\n')
    style.textContent = activatePrintStyles(embeddedStyles + '\n' + inlineCss)
    doc.head.appendChild(style)
    doc.body.style.margin = '0'
    const container = doc.createElement('div')
    container.className = 'print-all-pages'
    const stage = doc.importNode(sheet, false)
    stage.style.cssText += ';display:flow-root;width:210mm;margin:0;padding:0'
    container.appendChild(stage)
    doc.body.appendChild(container)

    const pdf = new jsPDF({ format: 'a4', unit: 'mm', compress: true })
    pdf.setProperties({ title: name })
    let page = 0
    for (const source of sourcePages(sheet)) {
      const content = doc.importNode(source, true)
      content.querySelectorAll('style').forEach(node => node.remove())
      if (stage.firstChild) stage.removeChild(stage.firstChild)
      if (source.matches('.printed-card-sheet, .beast-form-sheet')) {
        const section = doc.createElement('div')
        section.className = source.matches('.printed-card-sheet') ? 'page-four sheet-content-page' : 'sheet-content-page'
        section.appendChild(content)
        stage.appendChild(section)
      } else {
        stage.appendChild(content)
      }
      // Translate the margins into layout space so they are included in the capture.
      content.getBoundingClientRect()
      await waitForPrintImages(content)
      await doc.fonts?.ready
      const rect = stage.getBoundingClientRect()
      const fullHeight = Math.max(Math.ceil(rect.height), stage.scrollHeight)
      const rowStarts = Array.from(content.querySelectorAll('.card-row, .card-row-text'),
        row => Math.floor(row.getBoundingClientRect().top - rect.top))
      for (let top = 0; top < fullHeight;) {
        const inset = top > 0 ? Math.round(5 * PIXELS_PER_MM) : 0
        let bottom = Math.min(top + BODY_HEIGHT - inset, fullHeight)
        if (bottom < fullHeight) {
          // Keep the heading with the first row, even for a row taller than A4.
          const rowBreak = rowStarts.slice(1).filter(start => start > top && start <= bottom).pop()
          if (rowBreak !== undefined && rowBreak - top > 20) bottom = rowBreak
        }
        if (page > 0) pdf.addPage()
        onProgress(++page)
        const height = bottom - top
        const canvas = await html2canvas(stage, {
          y: top,
          width: rect.width,
          height,
          windowWidth: VIEWPORT_WIDTH,
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
        })
        try {
          const data = canvas.toDataURL('image/jpeg', 0.92)
          if (data === 'data:,') throw new Error('手机无法生成这一页的图像。')
          const topMM = inset / PIXELS_PER_MM
          const heightMM = Math.min(height / PIXELS_PER_MM, PAGE_HEIGHT - topMM)
          pdf.addImage(data, 'JPEG', 0, topMM, PAGE_WIDTH, heightMM)
        } finally {
          // WebKit retains canvas backing stores until they are explicitly cleared.
          canvas.width = canvas.height = 0
        }
        top = bottom
      }
    }
    if (!page) throw new Error('没有可导出的角色卡页面。')
    return pdf.output('blob')
  } finally {
    iframe.remove()
  }
}
