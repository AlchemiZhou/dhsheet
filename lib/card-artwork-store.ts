import { create } from 'zustand'
import { getCardArtworkEnabled, setCardArtworkEnabled } from './app-preferences'

/** Browser display preference, independent of character saves and legacy image mode. */
export const useCardArtworkStore = create<{
  enabled: boolean
  hydrate: () => void
  setEnabled: (enabled: boolean) => void
}>()((set) => ({
  enabled: false,
  hydrate: () => set({ enabled: getCardArtworkEnabled() }),
  setEnabled: (enabled) => {
    setCardArtworkEnabled(enabled)
    set({ enabled })
  },
}))
