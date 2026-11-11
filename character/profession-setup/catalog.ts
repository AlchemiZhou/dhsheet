import catalog from "@/data/character/profession-presets.json";
import type { StandardCard } from "@/card/card-types";
import type { ProfessionThemeId } from "@/character/appearance/theme";

export const PROFESSION_PRESETS = catalog;
export type ProfessionPreset = (typeof catalog)[keyof typeof catalog];
export function resolveProfessionPresetId(
  card?: StandardCard | null,
): ProfessionThemeId | undefined {
  if (card?.type !== "profession") return undefined;
  const tokens = [card.class, card.name, card.id].flatMap(
    (value) => value?.toLowerCase().split(/[^a-z\u4e00-\u9fff]+/) ?? [],
  );
  return (Object.keys(catalog) as ProfessionThemeId[]).find(
    (id) => tokens.includes(id) || tokens.includes(catalog[id].name),
  );
}
export function getProfessionPreset(
  card?: StandardCard | null,
): ProfessionPreset | undefined {
  const id = resolveProfessionPresetId(card);
  return id ? catalog[id] : undefined;
}
