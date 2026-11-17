import type { StandardCard } from "@/card/card-types";
import {
  getProfessionPreset,
  resolveProfessionPresetId,
} from "@/character/profession-setup/catalog";

/** Shared title resolution for the two editable pages; keep custom names intact. */
export function getProfessionHeaderDisplay(
  card?: StandardCard | null,
  referenceName?: string,
) {
  const title =
    referenceName === card?.name ||
    referenceName?.startsWith(`${card?.name}  -  `)
      ? card?.name
      : referenceName;
  const nativeId =
    title === getProfessionPreset(card)?.name
      ? resolveProfessionPresetId(card)
      : undefined;
  return { title, nativeId };
}
