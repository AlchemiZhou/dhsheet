'use client'
import { useEffect } from 'react'

import { useCardArtworkStore } from '@/lib/card-artwork-store'
import { useTextModeStore } from '@/lib/text-mode-store'
import { showFadeNotification } from '@/components/ui/fade-notification'

export function CardArtworkToggle() {
  const enabled = useCardArtworkStore((state) => state.enabled)
  const hydrate = useCardArtworkStore((state) => state.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  return (
    <button
      type="button"
      aria-pressed={enabled}
      className="pointer-events-auto min-h-11 cursor-pointer text-left underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      onClick={() => {
        const next = !enabled
        if (next) useTextModeStore.getState().setTextMode(false)
        useCardArtworkStore.getState().setEnabled(next)
        showFadeNotification({ message: next ? '插图取消隐藏' : '插图已隐藏', type: 'info' })
      }}
    >
      由 炼金术士阿刻米 特调
    </button>
  )
}
