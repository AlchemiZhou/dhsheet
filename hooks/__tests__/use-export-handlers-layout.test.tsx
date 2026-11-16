import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useExportHandlers } from '../use-export-handlers'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { useProfessionSetupPreferences } from '@/character/profession-setup/preferences'

const mocks = vi.hoisted(() => ({ exportToHTML: vi.fn() }))
vi.mock('@/lib/html-exporter', () => ({ exportToHTML: mocks.exportToHTML }))
vi.mock('@/card', () => ({ getStandardCardById: vi.fn() }))
vi.mock('@/lib/storage', () => ({ exportCharacterData: vi.fn() }))
function setup() {
  return renderHook(() => {
    const [layout, setReferencePrintOverride] = useState<boolean | undefined>()
    const handlers = useExportHandlers({ formData: defaultSheetData, setIsPrintingAll: vi.fn(), setReferencePrintOverride })
    return { layout, ...handlers }
  })
}
beforeEach(() => {
  mocks.exportToHTML.mockReset()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { callback(0); return 0 })
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  useProfessionSetupPreferences.getState().setReferencePrint(false)
})
afterEach(() => {
  useProfessionSetupPreferences.getState().setReferencePrint(true)
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
describe('HTML layout selection', () => {
  it('takes a reference-layout snapshot even when PDF uses the live layout, then restores the preference', async () => {
    let resolve!: () => void
    mocks.exportToHTML.mockImplementation(() => new Promise<void>(r => { resolve = r }))
    const { result } = setup()
    let pending!: Promise<void>
    await act(async () => { pending = result.current.handleExportHTML(); await Promise.resolve() })
    expect(result.current.layout).toBe(true)
    expect(useProfessionSetupPreferences.getState().referencePrint).toBe(false)
    expect(mocks.exportToHTML).toHaveBeenCalledWith(defaultSheetData)
    await act(async () => { resolve(); await pending })
    expect(result.current.layout).toBeUndefined()
    expect(useProfessionSetupPreferences.getState().referencePrint).toBe(false)
  })
  it('also restores the layout after a failed export', async () => {
    mocks.exportToHTML.mockRejectedValue(new Error('missing print asset'))
    const { result } = setup()
    await act(async () => { await result.current.handleExportHTML() })
    expect(result.current.layout).toBeUndefined()
    expect(useProfessionSetupPreferences.getState().referencePrint).toBe(false)
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('missing print asset'))
  })
})
