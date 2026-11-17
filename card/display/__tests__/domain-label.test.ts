import { describe, expect, it } from "vitest";
import { createEmptyCard } from "@/card/card-types";
import { DOMAIN_COLORS, DOMAIN_NAMES } from "@/character/appearance/theme";
import { getDomainCardLabel } from "../domain-label";

const card = (domain: string, level?: number) => ({
  ...createEmptyCard("domain"),
  name: "测试领域卡",
  class: domain,
  level,
});
describe("domain label metadata", () => {
  it("maps all ten domains consistently using each card, with supplied assets for the nine base domains", () => {
    for (const [id, name] of Object.entries(DOMAIN_NAMES)) {
      const value = card(name, 3),
        before = structuredClone(value),
        label = getDomainCardLabel(value)!;
      expect(label.id).toBe(id);
      expect(label.name).toBe(name);
      expect(label.level).toBe("3");
      expect(label.color).toBe(DOMAIN_COLORS[id as keyof typeof DOMAIN_COLORS]);
      expect(Boolean(label.asset)).toBe(id !== "dread");
      expect(value).toEqual(before);
    }
  });
  it("preserves existing translated names and uses a legacy level label only when no level is saved", () => {
    const value = card("恐惧");
    value.cardSelectDisplay.item4 = "LV.4";
    expect(getDomainCardLabel(value)).toMatchObject({
      id: "dread",
      name: "恐惧",
      level: "4",
    });
    value.level = 2;
    expect(getDomainCardLabel(value)?.level).toBe("2");
    expect(getDomainCardLabel(card("blade", 1))?.name).toBe("利刃");
  });
  it("does not invent a level or assign a known domain to custom cards", () => {
    expect(getDomainCardLabel(card("梦境"))).toMatchObject({
      name: "梦境",
      id: undefined,
      level: undefined,
      color: "#616161",
      asset: undefined,
    });
    expect(
      getDomainCardLabel({
        ...createEmptyCard("profession"),
        class: "优雅",
        level: 2,
      }),
    ).toBeUndefined();
  });
});
