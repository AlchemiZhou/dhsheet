import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PDFFileDialog } from '@/components/modals/pdf-file-dialog'
import { downloadCharacterFile } from '@/lib/download-character-file'

vi.mock('@/lib/download-character-file', () => ({ downloadCharacterFile: vi.fn() }))
const file = new File(['%PDF-1.7'], '角色卡.pdf', { type: 'application/pdf' })
const ready = () => render(<PDFFileDialog state={{ status: 'ready', blob: file, filename: file.name }} onClose={vi.fn()} onPrint={vi.fn()} />)

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('sharing a generated PDF', () => {
  it('passes the PDF file to the system share sheet on a fresh tap', async () => {
    const share = vi.fn(async () => {})
    const canShare = vi.fn((data: ShareData) => data.files?.length === 1)
    vi.stubGlobal('navigator', { share, canShare })
    ready()
    const shared = canShare.mock.calls[0][0].files!
    expect(shared[0].name).toBe(file.name)
    expect(shared[0].size).toBe(file.size)
    expect(share).not.toHaveBeenCalled()
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: '分享 PDF' })) })
    expect(share).toHaveBeenCalledWith({ files: shared })
  })

  it('can still download when the WebView has no File constructor', () => {
    vi.stubGlobal('File', undefined)
    vi.stubGlobal('navigator', { share: vi.fn(), canShare: vi.fn(() => true) })
    ready()
    expect(screen.queryByRole('button', { name: '分享 PDF' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '下载 PDF' }))
    expect(downloadCharacterFile).toHaveBeenCalledWith(file, file.name)
  })

  it('downloads the same file when the browser cannot share files', () => {
    vi.stubGlobal('navigator', { canShare: () => false })
    ready()
    expect(screen.queryByRole('button', { name: '分享 PDF' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: '下载 PDF' }))
    expect(downloadCharacterFile).toHaveBeenCalledWith(file, file.name)
  })
})
