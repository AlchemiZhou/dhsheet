"use client"

import { useEffect } from 'react'
import { CardType } from '@/card/card-types'
import { getProfessionDomains } from '@/card/profession-card/domains'
import { useCardStore } from '@/card/stores/unified-card-store'
import { useCardFilterStore } from '@/lib/card-filter-store'
import { useSheetStore } from '@/lib/sheet-store'

/** Set an editable default on entry, and when the active character/profession changes. */
export function useProfessionDomainFilter(isOpen: boolean, activeTab: string) {
  const snapshot = useSheetStore(state => state.sheetData.cards?.[0])
  const professionId = useSheetStore(state => state.sheetData.professionRef?.id)
  const sheetLoadRevision = useSheetStore(state => state.sheetLoadRevision)
  const template = useCardStore(state => professionId ? state.cards.get(professionId) : undefined)

  // A selected instance keeps its own domains until the user accepts a card update.
  // Reference-only saves can obtain their metadata once the card catalog is ready.
  const profession = snapshot?.type === CardType.Profession && snapshot.id && (!professionId || snapshot.id === professionId)
    ? snapshot
    : template?.type === CardType.Profession ? template : undefined
  const [firstDomain, secondDomain] = getProfessionDomains(profession)
  const selectedProfessionId = profession?.id

  useEffect(() => {
    if (!isOpen || activeTab !== CardType.Domain) return

    useCardFilterStore.getState().setClasses(
      [firstDomain, secondDomain].filter((domain): domain is string => domain !== undefined),
    )
  }, [isOpen, activeTab, selectedProfessionId, firstDomain, secondDomain, sheetLoadRevision])
}
