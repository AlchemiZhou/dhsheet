'use client'
import { useEffect } from 'react'

import { useCardArtworkStore } from '@/lib/card-artwork-store'
import { useTextModeStore } from '@/lib/text-mode-store'
import { showFadeNotification } from '@/components/ui/fade-notification'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

export function CardArtworkToggle({ menuItem = false }: { menuItem?: boolean }) {
  const enabled = useCardArtworkStore((state) => state.enabled)
  const hydrate = useCardArtworkStore((state) => state.hydrate)
  useEffect(() => {
    hydrate()
  }, [hydrate])
  const toggle = () => {
    const next = !enabled
    if (next) useTextModeStore.getState().setTextMode(false)
    useCardArtworkStore.getState().setEnabled(next)
    showFadeNotification({ message: next ? '插图取消隐藏' : '插图已隐藏', type: 'info' })
  }
  if (menuItem) {
    return <DropdownMenuItem onSelect={toggle} className="min-h-11">由 炼金术士阿刻米 特调</DropdownMenuItem>
  }
  return (
    <button
      type="button"
      aria-pressed={enabled}
      className="sheet-credit-author pointer-events-auto cursor-pointer text-left underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      onClick={toggle}
    >
      由 炼金术士阿刻米 特调
    </button>
  )
}
