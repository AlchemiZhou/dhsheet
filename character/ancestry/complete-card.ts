import { CardType, type StandardCard, type ExtendedStandardCard } from '@/card/card-types'
import type { SheetData } from '@/lib/sheet-data'
import { findAncestryPair } from './pair'

/** Display projection only. Both original cards remain the source of automation and saves. */
export interface CompleteAncestryCard extends ExtendedStandardCard {
  ancestryTraits: [StandardCard, StandardCard]
}

export function isCompleteAncestryCard(card: StandardCard): card is CompleteAncestryCard {
  return card.type === CardType.Ancestry && 'ancestryTraits' in card
}

export function createCompleteAncestryCard(first: ExtendedStandardCard, second: ExtendedStandardCard): CompleteAncestryCard | undefined {
  if (findAncestryPair(first, [second])?.id !== second.id) return undefined
  return {
    ...first,
    name: first.class || first.name,
    headerDisplay: first.class || first.name,
    description: `### ${first.name}\n\n${first.description}\n\n### ${second.name}\n\n${second.description}`,
    cardSelectDisplay: { item1: first.name, item2: second.name },
    ancestryTraits: [first, second],
  }
}

export function getSheetAncestryCard(sheet: SheetData): CompleteAncestryCard | undefined {
  if (sheet.mixedAncestry) return undefined
  const first = sheet.cards?.[2]
  const second = sheet.cards?.[3]
  if (!first || !second) return undefined
  return createCompleteAncestryCard(first, second)
}
