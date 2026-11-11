import type { SheetData } from "@/lib/sheet-data";
import type { ProfessionPreset } from "@/character/profession-setup/catalog";
import { getCompactCardTitle } from "@/card/display/compact-card";
import { createProfessionStory } from "@/character/profession-setup/story";

export interface ReferenceFieldBox {
  rect: number[];
  fontSize: number;
  checkbox: boolean;
}
export function referenceValues(sheet: SheetData): Record<string, string> {
  const ancestry = (index: number) =>
    sheet.cards?.[index]?.class || sheet.cards?.[index]?.name || "";
  const first = ancestry(2) || sheet.ancestry1Ref?.name || "";
  const second = ancestry(3) || sheet.ancestry2Ref?.name || "";
  const result: Record<string, string> = {
    name: sheet.name,
    ancestry: sheet.mixedAncestry
      ? [first, second].filter(Boolean).join("＋")
      : first,
    community: sheet.communityRef?.name || sheet.cards?.[4]?.name || "",
    subclass: sheet.cards?.[1]?.name
      ? getCompactCardTitle(sheet.cards[1])
      : sheet.subclassRef?.name || "",
    level: sheet.level,
    "total.evasion": sheet.evasion ?? "",
    "total.armor": String(sheet.armorMax ?? ""),
    "total.major": sheet.minorThreshold ?? "",
    "total.severe": sheet.majorThreshold ?? "",
  };
  const signed = (value: string) =>
    value !== "" && Number.isFinite(Number(value)) && Number(value) >= 0
      ? `+${Number(value)}`
      : value;
  for (const key of [
    "agility",
    "strength",
    "finesse",
    "instinct",
    "presence",
    "knowledge",
  ] as const)
    result[`total.${key}`] = signed(sheet[key]?.value ?? "");
  for (let i = 0; i < 5; i++) {
    result[`exp.${i + 1}.name`] = sheet.experience[i] ?? "";
    result[`exp.${i + 1}.bonus`] = signed(sheet.experienceValues?.[i] ?? "");
    result[`pack.${i}`] = sheet.inventory[i] ?? "";
  }
  const slots = {
    main: sheet.equipment.weaponSlots.primary,
    off: sheet.equipment.weaponSlots.secondary,
    reserve1: sheet.equipment.weaponSlots.inventory[0],
    reserve2: sheet.equipment.weaponSlots.inventory[1],
  };
  for (const [key, slot] of Object.entries(slots)) {
    result[`${key}.name`] = slot.name;
    result[`${key}.use`] = slot.trait;
    result[`${key}.damage`] = slot.damage;
    const attack = slot.damage.match(
      /^(敏捷|力量|灵巧|本能|风度|知识)\s*[:：]\s*(.+)$/,
    );
    const kind = slot.trait.match(/^(物理|魔法)\//);
    if (attack && kind) {
      const parts = slot.trait.split("/").slice(1);
      result[`${key}.use`] = [attack[1], ...parts.reverse()].join(" · ");
      result[`${key}.damage`] = `${attack[2]} ${kind[1]}`;
    }
    // A single multiline overlay spans both original feature writing rows.
    result[`${key}.feature`] = slot.feature;
  }
  const armor = sheet.equipment.armorSlot;
  result["armor.name"] = armor.name;
  result["armor.threshold"] = [
    armor.baseThresholds.minor ?? "",
    armor.baseThresholds.major ?? "",
  ].join("/");
  result["armor.rating"] = String(armor.baseArmorMax ?? "");
  result["armor.feature"] = armor.feature;
  const story =
    sheet.professionStory ?? createProfessionStory(sheet.cards?.[0]);
  for (let i = 0; i < 3; i++) {
    result[`background.${i + 1}`] = story.background[i]?.answer ?? "";
    result[`relationship.${i + 1}`] = story.connections[i]?.answer ?? "";
  }
  return result;
}

export function referenceCheckValue(name: string, sheet: SheetData): boolean {
  let match = name.match(/^track\.(hp|stress|armor)\.(\d+)$/);
  if (match)
    return Boolean(
      (match[1] === "armor"
        ? sheet.armorBoxes
        : sheet[match[1] as "hp" | "stress"])?.[Number(match[2]) - 1],
    );
  match = name.match(/^mark\.(\w+)$/);
  if (match) return Boolean(sheet[match[1] as "agility"]?.checked);
  match = name.match(
    /^guide\.(2|3|4)\.(trait|hp|stress|exp|domain|evasion|subclass|prof|multi)\.(\d+)$/,
  );
  if (match) {
    const row = [
      "trait",
      "hp",
      "stress",
      "exp",
      "domain",
      "evasion",
      "subclass",
      "prof",
      "multi",
    ].indexOf(match[2]);
    return (
      (
        sheet.upgradeStates?.[
          `tier${Number(match[1]) - 1}-${row}-${Number(match[3]) - 1}`
        ] ?? sheet.upgradeStates?.[`tier${Number(match[1]) - 1}-${row}`]
      )?.checked === true
    );
  }
  return false;
}

export function getReferenceBox(
  preset: ProfessionPreset,
  page: number,
  name: string,
): ReferenceFieldBox | undefined {
  return (
    preset.pages[page - 1].fields as unknown as Record<
      string,
      ReferenceFieldBox
    >
  )[name];
}

export function referenceFieldLabel(name: string): string {
  const clean = name.replace(/^[12]:/, "");
  const labels: Record<string, string> = {
    name: "姓名",
    ancestry: "种族",
    community: "社群",
    subclass: "子职业",
    level: "等级",
    "total.evasion": "闪避值",
    "total.armor": "护甲值",
    "total.agility": "敏捷",
    "total.strength": "力量",
    "total.finesse": "灵巧",
    "total.instinct": "本能",
    "total.presence": "风度",
    "total.knowledge": "知识",
  };
  if (labels[clean]) return labels[clean];
  const parts = clean.split(".");
  if (parts[0] === "pack") return `背包 ${Number(parts[1]) + 1}`;
  if (parts[0] === "exp") return `经历 ${parts[1]}`;
  if (parts[0] === "background") return `背景回答 ${parts[1]}`;
  if (parts[0] === "relationship") return `关系回答 ${parts[1]}`;
  if (name.startsWith("question:"))
    return name.includes("background") ? "背景问题描述" : "关系描述";
  return `${({ main: "主武器", off: "副武器", reserve1: "库存武器一", reserve2: "库存武器二", armor: "护甲" } as Record<string, string>)[parts[0]] ?? "角色"}补充内容`;
}
