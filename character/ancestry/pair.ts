import { CardType, type ExtendedStandardCard } from '@/card/card-types'

export function findAncestryPair(first: ExtendedStandardCard, cards: Iterable<ExtendedStandardCard>): ExtendedStandardCard | undefined {
  if (first.type !== CardType.Ancestry || first.level !== 1) return undefined
  const matches = Array.from(cards).filter(card => card.type === CardType.Ancestry && card.level === 2 &&
    card.class === first.class && card.hint === first.hint && card.batchId === first.batchId)
  return matches.length === 1 ? matches[0] : undefined
}
