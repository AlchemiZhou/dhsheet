"use client"
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { useSheetAppearanceStore } from '@/lib/sheet-appearance-store'
import { useSheetStore } from '@/lib/sheet-store'
import { useCardStore } from '@/card/stores/unified-card-store'
import { DEFAULT_SHEET_APPEARANCE, resolveSheetTheme } from '@/character/appearance/theme'
import { SHEET_APPEARANCE_STYLES } from '@/character/appearance/styles'

export function useSheetAppearanceAttributes() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const preferences = useSheetAppearanceStore(state => state.preferences)
  const professionRef = useSheetStore(state => state.sheetData.professionRef)
  const snapshot = useSheetStore(state => state.sheetData.cards?.[0])
  const cards = useCardStore(state => state.cards)
  const profession = (professionRef?.id ? cards.get(professionRef.id) : undefined) ?? (snapshot?.type === 'profession' && snapshot.id ? snapshot : undefined)
  const theme = resolveSheetTheme(mounted ? preferences : DEFAULT_SHEET_APPEARANCE, mounted ? profession : undefined)
  const printMode = mounted ? preferences.printMode : 'color'
  return { className: `sheet-appearance sheet-print-${printMode}`, 'data-print-mode': printMode, 'data-profession-theme': theme.id ?? 'neutral', style: { '--sheet-primary': theme.primary, '--sheet-secondary': theme.secondary } as CSSProperties }
}

export function SheetAppearanceProvider({ children }: { children: ReactNode }) {
  const attributes = useSheetAppearanceAttributes()
  return <div {...attributes}><style>{SHEET_APPEARANCE_STYLES}</style>{children}</div>
}
