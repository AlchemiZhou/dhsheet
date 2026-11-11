import type { StandardCard } from '@/card/card-types'

/** Use the selected card's own domains, including those defined by custom packs. */
export function getProfessionDomains(
  card?: Pick<StandardCard, 'type' | 'cardSelectDisplay'> | null,
): string[] {
  if (card?.type !== 'profession') return []

  return [...new Set(
    [card.cardSelectDisplay.item1, card.cardSelectDisplay.item2]
      .map(domain => domain?.trim())
      .filter((domain): domain is string => Boolean(domain)),
  )]
}
