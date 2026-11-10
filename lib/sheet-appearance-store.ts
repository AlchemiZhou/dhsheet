import { create } from 'zustand'
import { getSheetAppearance, setSheetAppearance } from './app-preferences'
import type { SheetAppearancePreferences } from '@/character/appearance/theme'

export const useSheetAppearanceStore = create<{
  preferences: SheetAppearancePreferences
  update: (value: Partial<SheetAppearancePreferences>) => void
}>((set) => ({
  preferences: getSheetAppearance(),
  update: value => set(state => {
    const preferences = { ...state.preferences, ...value }
    setSheetAppearance(preferences)
    return { preferences }
  }),
}))
