import { describe, expect, it } from "vitest";
import {
  paperFieldTarget,
  editablePaperField,
  paperFieldBox,
} from "../editor-fields";

describe("original field editing bindings", () => {
  it("routes final values to existing modifier targets rather than equipment bases", () => {
    expect(paperFieldTarget("total.agility")).toBe("agility.value");
    expect(paperFieldTarget("total.major")).toBe("minorThreshold");
    expect(paperFieldTarget("total.severe")).toBe("majorThreshold");
    expect(paperFieldTarget("total.armor")).toBe("armorMax");
    expect(paperFieldTarget("exp.5.bonus")).toBe("experienceValues.4");
    expect(paperFieldTarget("armor.rating")).toBeUndefined();
    expect(paperFieldTarget("exp.0.bonus")).toBeUndefined();
  });
  it("only accepts supported fields and uses the existing question/answer separation", () => {
    for (const field of [
      "name",
      "level",
      "pack.4",
      "background.3",
      "relationship.1",
    ])
      expect(editablePaperField(field)).toBe(true);
    for (const field of ["pack.5", "background.4", "guide.2.hp.1", "unknown"])
      expect(editablePaperField(field)).toBe(false);
    const box = { rect: [1, 2, 30, 70], fontSize: 10, checkbox: false };
    expect(paperFieldBox("background.1", box, 2).rect).toEqual([1, 15, 30, 67]);
    expect(paperFieldBox("name", box, 1)).toBe(box);
    expect(box.rect).toEqual([1, 2, 30, 70]);
  });
});
