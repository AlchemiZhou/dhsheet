'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { downloadCharacterFile } from '@/lib/download-character-file'

export type PDFFileState =
  | { status: 'generating'; page: number }
  | { status: 'ready'; file: File }
  | { status: 'failed'; message: string }

function supportsFileShare(file: File) {
  try {
    return typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] }) === true
  } catch {
    return false
  }
}

function FileActions({ file }: { file: File }) {
  const [sharing, setSharing] = useState(false)
  const [shareFailed, setShareFailed] = useState(false)
  const canShare = supportsFileShare(file)

  async function sharePDF() {
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
        {canShare && !shareFailed
          ? '在系统分享菜单里选择微信或 QQ。也可以先下载，再从聊天窗口发送文件。'
          : '请先下载 PDF，再从微信或 QQ 聊天窗口发送文件。'}
      </p>
      <DialogFooter>
        <Button variant={canShare && !shareFailed ? 'outline' : 'default'} onClick={() => downloadCharacterFile(file, file.name)}>
          下载 PDF
        </Button>
        {canShare && <Button disabled={sharing} onClick={sharePDF}>分享 PDF</Button>}
      </DialogFooter>
    </>
  )
}

export function PDFFileDialog({ state, onClose, onPrint }: {
  state: PDFFileState | null
  onClose: () => void
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
            {state?.status === 'ready' && <span className="break-all">{state.file.name}</span>}
          </DialogDescription>
        </DialogHeader>
        {state?.status === 'ready' && <FileActions file={state.file} />}
        {state?.status === 'failed' && <DialogFooter><Button onClick={onPrint}>使用系统打印</Button></DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
