import type { SheetData } from "@/lib/sheet-data";

export const COMPANION_PORTRAIT = { left: 54.58, top: 118.68, size: 96.3 };
export const COMPANION_TRAINING_ROWS = [
  ["intelligent", 565, 3],
  ["radiantInDarkness", 592.74, 1],
  ["creatureComfort", 618.48, 1],
  ["armored", 660.27, 1],
  ["vicious", 690.58, 3],
  ["resilient", 721.27, 3],
  ["bonded", 740.96, 1],
  ["aware", 804.15, 3],
] as const;

export function companionPrintValues(sheet: SheetData) {
  const [attack, ...attackRange] = (sheet.companionWeapon ?? '').split(/\s*[/／|｜]\s*/)
  return {
    name: sheet.companionName ?? "",
    description: sheet.companionDescription ?? "",
    evasion: sheet.companionEvasion ?? "",
    attack,
    attackRange: attackRange.join(' / '),
    experiences: Array.from({ length: 5 }, (_, i) => ({
      name: sheet.companionExperience?.[i] ?? "",
      bonus: sheet.companionExperienceValue?.[i] ?? "",
    })),
    stress: Array.from({ length: 6 }, (_, i) =>
      Boolean(sheet.companionStress?.[i]),
    ),
    stressMax: Math.max(1, Math.min(6, Number(sheet.companionStressMax) || 3)),
  };
}
