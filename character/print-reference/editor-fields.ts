import { isExtraReferenceField, REFERENCE_EXTRA_LABELS } from "./extra-values";
import type { ModifierTargetId } from "@/automation/core/types";
import { referenceFieldLabel, type ReferenceFieldBox } from "./model";

const targets: Record<string, ModifierTargetId> = {
  "total.evasion": "evasion",
  "total.armor": "armorMax",
  "total.major": "minorThreshold",
  "total.severe": "majorThreshold",
  ...Object.fromEntries(
    ["agility", "strength", "finesse", "instinct", "presence", "knowledge"].map(
      (k) => [`total.${k}`, `${k}.value`],
    ),
  ),
};
export function paperFieldTarget(name: string): ModifierTargetId | undefined {
  const match = name.match(/^exp\.([1-5])\.bonus$/);
  return match
    ? (`experienceValues.${Number(match[1]) - 1}` as ModifierTargetId)
    : targets[name];
}
export function editablePaperField(name: string): boolean {
  return (
    isExtraReferenceField(name) ||
    name === "name" ||
    name === "level" ||
    Boolean(paperFieldTarget(name)) ||
    /^exp\.[1-5]\.name$|^pack\.[0-4]$|^(background|relationship)\.[1-3]$/.test(
      name,
    )
  );
}
export function paperFieldBox(
  name: string,
  field: ReferenceFieldBox,
  page: number,
): ReferenceFieldBox {
  return page === 2 && /^(background|relationship)\./.test(name)
    ? {
        ...field,
        rect: [
          field.rect[0],
          field.rect[1] + 13,
          field.rect[2],
          field.rect[3] - 3,
        ],
        fontSize: 10,
      }
    : field;
}

export function paperFieldLabel(name: string): string {
  if (isExtraReferenceField(name)) return REFERENCE_EXTRA_LABELS[name];
  const totals: Record<string, string> = {
    "total.major": "重伤阈值",
    "total.severe": "严重伤害阈值",
  };
  if (totals[name]) return totals[name];
  const exp = name.match(/^exp\.([1-5])\.(name|bonus)$/);
  if (exp) return `经历 ${exp[1]}${exp[2] === "name" ? "名称" : "加值"}`;
  const equipment = name.match(
    /^(main|off|reserve1|reserve2|armor)\.(name|use|damage|feature|threshold|rating)$/,
  );
  if (equipment) {
    const slot: Record<string, string> = {
      main: "主武器",
      off: "副武器",
      reserve1: "库存武器一",
      reserve2: "库存武器二",
      armor: "护甲",
    };
    const part: Record<string, string> = {
      name: "名称",
      use: "使用属性与攻击距离",
      damage: "伤害值与类型",
      feature: "特性",
      threshold: "基础阈值",
      rating: "基础护甲值",
    };
    return slot[equipment[1]] + part[equipment[2]];
  }
  return referenceFieldLabel(name);
}
