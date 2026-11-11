import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useIsMobile } from '../use-mobile'

describe('mobile media-query compatibility', () => {
  it.each(['modern', 'legacy'])('subscribes, resizes and unsubscribes with %s APIs', (mode) => {
    const subscribe = vi.fn(),
      unsubscribe = vi.fn()
    const media =
      mode === 'modern'
        ? { addEventListener: subscribe, removeEventListener: unsubscribe }
        : { addListener: subscribe, removeListener: unsubscribe }
    const match = vi.spyOn(window, 'matchMedia').mockReturnValue(media as unknown as MediaQueryList)
    const original = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1440 })
    try {
      const { result, unmount } = renderHook(() => useIsMobile())
      expect(result.current).toBe(false)
      const listener = subscribe.mock.calls[0][mode === 'modern' ? 1 : 0]
      act(() => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 })
        listener()
      })
      expect(result.current).toBe(true)
      unmount()
      expect(unsubscribe).toHaveBeenCalledWith(...(mode === 'modern' ? ['change', listener] : [listener]))
    } finally {
      match.mockRestore()
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: original })
    }
  })
})
