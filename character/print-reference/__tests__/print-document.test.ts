import { afterEach, describe, expect, it, vi } from 'vitest'
import { printSheetPDF } from '../print-document'
import { useSheetAppearanceStore } from '@/lib/sheet-appearance-store'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('explicit PDF palettes', () => {
  it('prints the requested palette after committing it, including when exporting color after mono', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 0 })
    const palettes: string[] = []
    vi.spyOn(window, 'print').mockImplementation(() => { palettes.push(useSheetAppearanceStore.getState().preferences.printMode) })
    await printSheetPDF('mono')
    await printSheetPDF('color')
    expect(palettes).toEqual(['mono', 'color'])
  })
})
