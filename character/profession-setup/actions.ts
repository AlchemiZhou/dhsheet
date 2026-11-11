import type { SheetData } from "@/lib/sheet-data";
import type { StandardCard } from "@/card/card-types";
import { allWeapons } from "@/data/list/all-weapons";
import { armorItems } from "@/data/list/armor";
import { createEmptyWeaponSlot } from "@/automation/equipment/defaults";
import {
  createWeaponSlotFromBuiltinTemplate,
  createArmorSlotFromBuiltinTemplate,
} from "@/automation/equipment/template-to-slot";
import { getProfessionPreset } from "./catalog";
import { createProfessionStory } from "./story";
import { reconcileFinalInput } from "@/automation/core/final-input-reconciliation";
import { applyAutoCalculationForTargets } from "@/automation/core/target-sync";

export function applyProfessionPreset(
  sheet: SheetData,
  card: StandardCard | undefined,
  autoSetup: boolean,
): SheetData {
  let next: SheetData = {
    ...sheet,
    professionStory: createProfessionStory(card, sheet.professionStory),
  };
  const preset = getProfessionPreset(card);
  if (!autoSetup || !preset) return next;
  const cleanName = (name: string) => name.split(/[·∙]/)[0].trim();
  const customEffects = (feature: string, slot: string) => {
    const effects: import("@/automation/equipment/types").EquipmentModifierContribution[] =
      [];
    const add = (
      target: "evasion" | "armorMax" | "minorThreshold" | "majorThreshold",
      value: number,
    ) =>
      effects.push({
        id: `profession-preset:${card!.id}:${slot}:${target}`,
        definition: { target, kind: "modifier" },
        editable: { label: feature, value },
      });
    const evasion = feature.match(/闪避值\s*[+＋]\s*(\d+)/);
    if (evasion) add("evasion", Number(evasion[1]));
    const armorBonus = feature.match(/护甲值\s*[+＋]\s*(\d+)/);
    if (armorBonus) add("armorMax", Number(armorBonus[1]));
    const threshold = feature.match(/伤害阈值\s*[+＋]\s*(\d+)/);
    const bonus = threshold
      ? Number(threshold[1])
      : feature.includes("等同于施法属性")
        ? Math.max(...Object.values(preset.attributes).map(Number))
        : 0;
    if (bonus) {
      add("minorThreshold", bonus);
      add("majorThreshold", bonus);
    }
    return effects;
  };
  const weapon = (slot: "primary" | "secondary") => {
    const entry = preset.weapons[slot];
    if (!entry.name) return createEmptyWeaponSlot();
    const match = allWeapons.find(
      (value) => value.tier === "T1" && value.name === cleanName(entry.name),
    );
    const [attribute, range, burden] = entry.trait
      .split("·")
      .map((value) => value.trim());
    const [dice, damageType] = entry.damage.split(/\s+/);
    // Expanded classes can recommend a weapon absent from the core equipment catalog.
    // In that case the supplied PDF is the explicit source of the custom slot.
    return match
      ? createWeaponSlotFromBuiltinTemplate(
          match,
          (id) => `profession-preset:${card!.id}:${slot}:${id}`,
        )
      : {
          name: cleanName(entry.name),
          trait: [damageType, burden, range].join("/"),
          damage: `${attribute}: ${dice}`,
          feature: entry.feature === "—" ? "" : entry.feature,
          modifierContributions: customEffects(entry.feature, slot),
        };
  };
  const armor = armorItems.find(
    (value) =>
      value.tier === "T1" && value.name === cleanName(preset.armor.name),
  );
  const [minor, major] = preset.armor.threshold.split("/").map(Number);
  next = {
    ...next,
    armorBoxes: Array(12).fill(false),
    equipment: {
      ...next.equipment,
      weaponSlots: {
        ...next.equipment.weaponSlots,
        primary: weapon("primary"),
        secondary: weapon("secondary"),
      },
      armorSlot: armor
        ? createArmorSlotFromBuiltinTemplate(
            armor,
            (id) => `profession-preset:${card!.id}:armor:${id}`,
          )
        : {
            name: cleanName(preset.armor.name),
            baseArmorMax: Number(preset.armor.rating),
            baseThresholds: { minor, major },
            feature: preset.armor.feature,
            modifierContributions: customEffects(preset.armor.feature, "armor"),
          },
    },
  };
  for (const [attribute, value] of Object.entries(preset.attributes)) {
    next = reconcileFinalInput(
      next,
      `${attribute}.value` as import("@/automation/core/types").ModifierTargetId,
      Number(value),
    );
  }
  return applyAutoCalculationForTargets(next);
}
