import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { characterExportTitle } from '@/character/storage/export-title'
import { exportCharacterData } from '@/lib/storage'
import { APP_TITLE } from '@/lib/seo'
import type { SheetData } from '@/lib/sheet-data'
import type { PDFFileState } from '@/components/modals/pdf-file-dialog'
import { printSheetPDF, type PDFPrintMode } from '@/character/print-reference/print-document'

// 配置常量
const WAIT_TIMEOUT = 10000  // 10 秒超时
const CHECK_INTERVAL = 100  // 100ms 检查间隔
const RENDER_DELAY = 300    // 渲染延迟

interface UseExportHandlersProps {
  formData: SheetData
  setIsPrintingAll: (value: boolean) => void
  setReferencePrintOverride: (value: boolean | undefined) => void
}

/**
 * 等待所有图片加载完成
 *
 * 使用 DOM 查询直接检查图片状态，避免闭包问题。
 */
function waitForAllImagesLoaded(): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const checkImages = () => {
      const images = document.querySelectorAll<HTMLImageElement>('.print-all-pages img')
      const total = images.length

      if (total === 0) {
        // 没有图片，直接完成
        setTimeout(resolve, RENDER_DELAY)
        return
      }

      let loaded = 0
      images.forEach(img => {
        // img.complete 在加载成功、失败或无 src 时都为 true
        if (img.complete) {
          loaded++
        }
      })

      const elapsed = Date.now() - startTime

      if (loaded === total) {
        // 所有图片加载完成
        console.log(`[ExportHandlers] 所有图片加载完成 (${loaded}/${total})`)
        setTimeout(resolve, RENDER_DELAY)
      } else if (elapsed >= WAIT_TIMEOUT) {
        // 超时
        console.log(`[ExportHandlers] 图片加载超时 (${loaded}/${total})，继续执行`)
        resolve()
      } else {
        // 继续等待
        setTimeout(checkImages, CHECK_INTERVAL)
      }
    }

    // 延迟启动，给组件渲染时间
    setTimeout(checkImages, 200)
  })
}

export function useExportHandlers({
  formData,
  setIsPrintingAll,
  setReferencePrintOverride,
}: UseExportHandlersProps) {

  const quickPrint = useRef(false)
  const generatingPDF = useRef(false)
  const requestedPDFMode = useRef<PDFPrintMode>('color')
  const [pdfFileState, setPDFFileState] = useState<PDFFileState | null>(null)
  const onAfterPrint = useCallback(() => {
    if (quickPrint.current) {
      quickPrint.current = false
      setIsPrintingAll(false)
      document.title = APP_TITLE
    }
  }, [setIsPrintingAll])

  // 打印所有页面
  const handlePrintAll = useCallback(async () => {
    quickPrint.current = false
    document.title = characterExportTitle(formData)
    setIsPrintingAll(true)

    // 等待 React 完成渲染
    await new Promise(resolve => setTimeout(resolve, 100))
  }, [formData, setIsPrintingAll])

  // HTML 导出
  const handleExportHTML = useCallback(async () => {
    try {
      console.log('[ExportHandlers] 开始 HTML 导出')
      // HTML is the portable character-card view, independent of the user's
      // PDF layout preference. Restore that preference after taking the snapshot.
      flushSync(() => setReferencePrintOverride(true))
      await document.fonts?.ready
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      const { exportToHTML } = await import('@/lib/html-exporter')
      await exportToHTML(formData)
      console.log('[ExportHandlers] HTML 导出完成')
    } catch (error) {
      console.error('[ExportHandlers] HTML 导出失败:', error)
      alert('HTML导出失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setReferencePrintOverride(undefined)
    }
  }, [formData, setReferencePrintOverride])

  // JSON 导出
  const handleExportJSON = useCallback(async () => {
    try {
      await exportCharacterData(formData)
      console.log('[ExportHandlers] JSON 导出完成')
    } catch (error) {
      console.error('[ExportHandlers] JSON 导出失败:', error)
      alert('JSON导出失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }, [formData])

  // 快速 PDF 导出
  const handleQuickExportPDF = useCallback(async (mode: PDFPrintMode = 'color') => {
    try {
      console.log('[ExportHandlers] 快速 PDF 导出')
      await handlePrintAll()
      quickPrint.current = true
      await printSheetPDF(mode)
    } catch (error) {
      console.error('[ExportHandlers] 快速 PDF 导出失败:', error)
      alert('PDF导出失败: ' + (error instanceof Error ? error.message : '未知错误'))
      setIsPrintingAll(false)
      document.title = APP_TITLE
    }
  }, [handlePrintAll, setIsPrintingAll])

  const handlePDFFile = useCallback(async (mode: PDFPrintMode = 'color', fromPreview = false) => {
    if (generatingPDF.current) return
    generatingPDF.current = true
    requestedPDFMode.current = mode
    try {
      flushSync(() => {
        setPDFFileState({ status: 'generating', page: 0 })
        if (!fromPreview) setIsPrintingAll(true)
      })
      const { createSheetPDFFile } = await import('@/character/print-reference/pdf-file')
      const title = characterExportTitle(formData)
      const blob = await createSheetPDFFile(mode, title, page => {
        setPDFFileState({ status: 'generating', page })
      })
      setPDFFileState({ status: 'ready', blob, filename: title + '.pdf' })
    } catch (error) {
      console.error('[ExportHandlers] PDF file generation failed', error)
      setPDFFileState({ status: 'failed', message: error instanceof Error ? error.message : String(error) })
    } finally {
      generatingPDF.current = false
      if (!fromPreview) setIsPrintingAll(false)
    }
  }, [formData, setIsPrintingAll])

  const closePDFFile = useCallback(() => setPDFFileState(null), [])
  const printPDFFileFallback = useCallback(() => {
    closePDFFile()
    void handleQuickExportPDF(requestedPDFMode.current)
  }, [closePDFFile, handleQuickExportPDF])

  // 快速 HTML 导出
  const handleQuickExportHTML = useCallback(async () => {
    try {
      console.log('[ExportHandlers] 快速 HTML 导出')
      await handlePrintAll()
      await waitForAllImagesLoaded()
      await document.fonts?.ready
      await handleExportHTML()
    } catch (error) {
      console.error('[ExportHandlers] 快速 HTML 导出失败:', error)
      alert('HTML导出失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsPrintingAll(false)
      document.title = APP_TITLE
    }
  }, [handlePrintAll, handleExportHTML, setIsPrintingAll])

  return {
    handlePrintAll,
    handleExportHTML,
    handleExportJSON,
    handleQuickExportPDF,
    handlePDFFile,
    pdfFileState,
    closePDFFile,
    printPDFFileFallback,
    handleQuickExportHTML,
    handleQuickExportJSON: handleExportJSON,
    onAfterPrint,
  }
}
