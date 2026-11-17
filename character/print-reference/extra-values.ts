/** Manual notes/counters printed on profession-specific original forms. */
export const REFERENCE_EXTRA_LABELS: Record<string, string> = {
  "guardian.unstoppable": "势不可挡骰",
  "wizard.strange.pattern": "奇异规律数字",
  "warlock.patron": "宗主",
  "warlock.sphere": "宗主领域",
  ...Object.fromEntries(
    Array.from({ length: 6 }, (_, i) => [
      `seraph.prayer.${i + 1}`,
      `祈祷骰 ${i + 1}`,
    ]),
  ),
};
export function isExtraReferenceField(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(REFERENCE_EXTRA_LABELS, name);
}
export function isReferenceFieldValues(
  value: unknown,
): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}
export function normalizeReferenceFieldValues(
  value: unknown,
): Record<string, string> {
  if (value === undefined) return {};
  if (!isReferenceFieldValues(value))
    throw new Error("原版填写格数据必须是文本记录。");
  return { ...value };
}
