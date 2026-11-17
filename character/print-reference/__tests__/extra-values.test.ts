import { describe, expect, it } from "vitest";
import { normalizeReferenceFieldValues } from "../extra-values";
import { referenceValues } from "../model";
import { defaultSheetData } from "@/lib/default-sheet-data";
import { migrateSheetData } from "@/lib/sheet-data-migration";
import { validateAndProcessCharacterData } from "@/lib/character-data-validator";

describe("original-form manual fields", () => {
  it("normalizes old saves and preserves notes across migration/import", () => {
    const raw = {
      ...structuredClone(defaultSheetData),
      cards: [],
      referenceFieldValues: undefined,
    };
    expect(migrateSheetData(raw).referenceFieldValues).toEqual({});
    const result = validateAndProcessCharacterData({
      ...raw,
      referenceFieldValues: {
        "warlock.patron": "星海之主",
        "seraph.prayer.2": "6",
      },
    });
    expect(result.valid).toBe(true);
    expect(result.data?.referenceFieldValues?.["warlock.patron"]).toBe(
      "星海之主",
    );
  });
  it("rejects malformed values rather than silently dropping them", () => {
    for (const value of [null, [], { "warlock.patron": 123 }])
      expect(() => normalizeReferenceFieldValues(value)).toThrow();
    const result = validateAndProcessCharacterData({
      ...structuredClone(defaultSheetData),
      cards: [],
      referenceFieldValues: { "wizard.strange.pattern": 9 },
    });
    expect(result.valid).toBe(false);
  });
  it("only projects profession-specific extras and cannot overwrite core values", () => {
    const values = referenceValues({
      ...structuredClone(defaultSheetData),
      name: "实际姓名",
      referenceFieldValues: { name: "不可覆盖", "warlock.patron": "星海之主" },
    });
    expect(values.name).toBe("实际姓名");
    expect(values["warlock.patron"]).toBe("星海之主");
  });
});
