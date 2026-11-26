import { useCallback, useRef, useState, type RefObject } from 'react'
import { flushSync } from 'react-dom'
import { characterExportTitle } from '@/character/storage/export-title'
import { exportCharacterData } from '@/lib/storage'
import { APP_TITLE } from '@/lib/seo'
import type { SheetData } from '@/lib/sheet-data'
import type { PDFFileState } from '@/components/modals/pdf-file-dialog'
import { printSheetPDF, type PDFPrintMode } from '@/character/print-reference/print-document'

interface UseExportHandlersProps {
  printContainerRef: RefObject<HTMLElement | null>
  formData: SheetData
  setIsPrintingAll: (value: boolean) => void
  setReferencePrintOverride: (value: boolean | undefined) => void
}

export function useExportHandlers({
  printContainerRef,
  formData,
  setIsPrintingAll,
  setReferencePrintOverride,
}: UseExportHandlersProps) {

  const quickPrint = useRef(false)
  const generatingPDF = useRef(false)
  const lastPDFRequest = useRef<{ mode: PDFPrintMode; fromPreview: boolean }>({ mode: 'color', fromPreview: false })
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
      flushSync(() => {
        setIsPrintingAll(true)
        setReferencePrintOverride(true)
      })
      const previewRoot = printContainerRef.current
      if (!previewRoot) throw new Error('未找到角色卡预览。')
      await document.fonts?.ready
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
      const { exportToHTML } = await import('@/lib/html-exporter')
      await exportToHTML(formData, { previewRoot })
      console.log('[ExportHandlers] HTML 导出完成')
    } catch (error) {
      console.error('[ExportHandlers] HTML 导出失败:', error)
      alert('HTML导出失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setReferencePrintOverride(undefined)
    }
  }, [formData, printContainerRef, setIsPrintingAll, setReferencePrintOverride])

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
    lastPDFRequest.current = { mode, fromPreview }
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

  const retryPDFFile = useCallback(() => {
    const { mode, fromPreview } = lastPDFRequest.current
    void handlePDFFile(mode, fromPreview)
  }, [handlePDFFile])

  const closePDFFile = useCallback(() => setPDFFileState(null), [])
  const printPDFFileFallback = useCallback(() => {
    closePDFFile()
    void handleQuickExportPDF(lastPDFRequest.current.mode)
  }, [closePDFFile, handleQuickExportPDF])

  // 快速 HTML 导出
  const handleQuickExportHTML = useCallback(async () => {
    try {
      console.log('[ExportHandlers] 快速 HTML 导出')
      await handleExportHTML()
    } catch (error) {
      console.error('[ExportHandlers] 快速 HTML 导出失败:', error)
      alert('HTML导出失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setIsPrintingAll(false)
      document.title = APP_TITLE
    }
  }, [handleExportHTML, setIsPrintingAll])

  return {
    handlePrintAll,
    handleExportHTML,
    handleExportJSON,
    handleQuickExportPDF,
    handlePDFFile,
    pdfFileState,
    closePDFFile,
    retryPDFFile,
    printPDFFileFallback,
    handleQuickExportHTML,
    handleQuickExportJSON: handleExportJSON,
    onAfterPrint,
  }
}
