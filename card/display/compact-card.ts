import type { StandardCard } from "@/card/card-types"

/** Shorten only the generated subclass tier suffix, never the rules text. */
export function getCompactCardTitle(card: StandardCard): string {
  if (card.type !== "subclass" || card.level !== 1 || !card.headerDisplay) return card.name

  return card.name === `${card.headerDisplay}基石` ? card.headerDisplay : card.name
}

export function getCompactCardTier(card: StandardCard): string {
  const tier = card.cardSelectDisplay?.item2 ?? ""
  return card.type === "subclass" && card.level === 1 && tier === "基石" ? "" : tier
}
