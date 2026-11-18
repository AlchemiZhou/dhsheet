import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PDFFileDialog } from '@/components/modals/pdf-file-dialog'
import { downloadCharacterFile } from '@/lib/download-character-file'

vi.mock('@/lib/download-character-file', () => ({ downloadCharacterFile: vi.fn() }))
const file = new File(['%PDF-1.7'], '角色卡.pdf', { type: 'application/pdf' })
const ready = () => render(<PDFFileDialog state={{ status: 'ready', file }} onClose={vi.fn()} onPrint={vi.fn()} />)

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('sharing a generated PDF', () => {
  it('passes the PDF file to the system share sheet on a fresh tap', () => {
    const share = vi.fn(async () => {})
    const canShare = vi.fn(() => true)
    vi.stubGlobal('navigator', { share, canShare })
    ready()
    expect(canShare).toHaveBeenCalledWith({ files: [file] })
    expect(share).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '分享 PDF' }))
    expect(share).toHaveBeenCalledWith({ files: [file] })
  })

  it('downloads the same file when the browser cannot share files', () => {
    vi.stubGlobal('navigator', { canShare: () => false })
    ready()
    expect(screen.queryByRole('button', { name: '分享 PDF' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '下载 PDF' }))
    expect(downloadCharacterFile).toHaveBeenCalledWith(file, file.name)
  })
})
