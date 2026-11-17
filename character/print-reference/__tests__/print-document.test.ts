import { afterEach, describe, expect, it, vi } from 'vitest'
import { printSheetPDF } from '../print-document'
import { useSheetAppearanceStore } from '@/lib/sheet-appearance-store'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('explicit PDF palettes', () => {
  it('waits for late print images and prevents printing a missing asset', async () => {
    vi.useFakeTimers()
    document.body.innerHTML = '<div class="print-pages-scroll-content"><img alt="战士角色卡"></div>'
    try {
      vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 0 })
      const print = vi.spyOn(window, 'print').mockImplementation(() => {})
      const image = document.querySelector('img')!
      Object.defineProperties(image, { complete: { value: true }, naturalWidth: { value: 0, configurable: true } })
      const failure = expect(printSheetPDF()).rejects.toThrow('战士角色卡')
      await vi.advanceTimersByTimeAsync(10_100)
      await failure
      expect(print).not.toHaveBeenCalled()
      const retry = printSheetPDF()
      await vi.advanceTimersByTimeAsync(100)
      Object.defineProperty(image, 'naturalWidth', { value: 100 })
      await vi.advanceTimersByTimeAsync(100)
      await retry
      expect(print).toHaveBeenCalledTimes(1)
    } finally {
      document.body.innerHTML = ''
      vi.useRealTimers()
    }
  })
  it('prints the requested palette after committing it, including when exporting color after mono', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 0 })
    const palettes: string[] = []
    vi.spyOn(window, 'print').mockImplementation(() => { palettes.push(useSheetAppearanceStore.getState().preferences.printMode) })
    await printSheetPDF('mono')
    await printSheetPDF('color')
    expect(palettes).toEqual(['mono', 'color'])
  })
})
