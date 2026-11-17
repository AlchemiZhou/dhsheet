import type { StandardCard } from "@/card/card-types";
import {
  DOMAIN_COLORS,
  DOMAIN_NAMES,
  resolveDomainId,
} from "@/character/appearance/theme";

/** Presentation metadata only: never changes a card's domain or level. */
export function getDomainCardLabel(card?: StandardCard | null) {
  if (card?.type !== "domain") return undefined;
  const raw = (card.class || card.cardSelectDisplay?.item1 || "")
    .trim()
    .replace(/领域$/, "");
  const id = resolveDomainId(raw);
  const name = raw
    ? id && raw.toLowerCase() === id
      ? DOMAIN_NAMES[id]
      : raw
    : "未指定领域";
  const level =
    card.level !== undefined && card.level !== null && String(card.level).trim()
      ? String(card.level)
      : card.cardSelectDisplay?.item4?.match(/^LV\.?\s*(\d+)$/i)?.[1];
  return {
    id,
    name,
    level,
    color: id ? DOMAIN_COLORS[id] : "#616161",
    asset: id && id !== "dread" ? `/domain-labels/${id}.png` : undefined,
  };
}
