'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { downloadCharacterFile } from '@/lib/download-character-file'

export type PDFFileState =
  | { status: 'generating'; page: number }
  | { status: 'ready'; blob: Blob; filename: string }
  | { status: 'failed'; message: string }

function getShareableFile(blob: Blob, filename: string): File | null {
  if (typeof navigator.share !== 'function' || typeof navigator.canShare !== 'function') return null
  try {
    const file = new File([blob], filename, { type: 'application/pdf' })
    return navigator.canShare({ files: [file] }) ? file : null
  } catch {
    return null
  }
}

function FileActions({ blob, filename }: { blob: Blob; filename: string }) {
  const [sharing, setSharing] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const file = useMemo(() => getShareableFile(blob, filename), [blob, filename])

  const [url, setUrl] = useState('')
  useEffect(() => {
    if (typeof URL.createObjectURL !== 'function') return
    const href = URL.createObjectURL(blob)
    setUrl(href)
    return () => URL.revokeObjectURL(href)
  }, [blob])

  async function sharePDF() {
    if (!file) return
    setShareFailed(false)
    setSharing(true)
    try {
      // The system share sheet requires a fresh tap after generation.
      await navigator.share({ files: [file] })
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) setShareFailed(true)
    } finally {
      setSharing(false)
    }
  }

  return (
    <>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {file && !shareFailed
          ? '打开 PDF 即可查看角色卡。点「分享 PDF」可选择微信或 QQ。'
          : '可打开 PDF 查看角色卡，也可以下载后从聊天窗口发送。'}
      </p>
      <DialogFooter>
        {url && <Button asChild><a href={url} target="_blank" rel="noopener noreferrer">打开 PDF</a></Button>}
        <Button variant="outline" onClick={() => downloadCharacterFile(blob, filename)}>
          下载 PDF
        </Button>
        {file && <Button variant="outline" disabled={sharing} onClick={sharePDF}>分享 PDF</Button>}
      </DialogFooter>
    </>
  )
}

export function PDFFileDialog({ state, onClose, onRetry, onPrint }: {
  state: PDFFileState | null
  onClose: () => void
  onRetry: () => void
  onPrint: () => void
}) {
  const busy = state?.status === 'generating'
  return (
    <Dialog open={Boolean(state)} onOpenChange={open => { if (!open && !busy) onClose() }}>
      <DialogContent className={busy ? '[&>button:last-child]:hidden' : undefined}>
        <DialogHeader>
          <DialogTitle>{busy ? '正在生成 PDF' : state?.status === 'failed' ? 'PDF 生成失败' : 'PDF 已生成'}</DialogTitle>
          <DialogDescription aria-live="polite">
            {state?.status === 'generating' && (state.page > 0 ? `正在排版第 ${state.page} 页…` : '正在准备角色卡…')}
            {state?.status === 'failed' && state.message}
            {state?.status === 'ready' && <span className="break-all">{state.filename}</span>}
          </DialogDescription>
        </DialogHeader>
        {state?.status === 'ready' && <FileActions blob={state.blob} filename={state.filename} />}
        {state?.status === 'failed' && <DialogFooter>
          <Button onClick={onRetry}>重新生成 PDF</Button>
          <Button variant="outline" onClick={onPrint}>使用系统打印</Button>
        </DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
