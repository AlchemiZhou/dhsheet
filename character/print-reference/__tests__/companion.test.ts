import { describe, it, expect } from "vitest";
import { defaultSheetData } from "@/lib/default-sheet-data";
import { COMPANION_PORTRAIT, companionPrintValues } from "../companion";
describe("companion print projection", () => {
  it("retains companion fields and marks without changing the saved character", () => {
    const sheet = structuredClone(defaultSheetData);
    sheet.companionName = "松影";
    sheet.companionDescription = "谨慎的灰狼";
    sheet.companionStressMax = 5;
    sheet.companionWeapon = '撕咬 / 近战';
    sheet.companionStress = [true, false, true];
    sheet.companionExperience = ["追踪"];
    sheet.companionExperienceValue = ["2"];
    const before = JSON.stringify(sheet);
    const value = companionPrintValues(sheet);
    expect(value.name).toBe("松影");
    expect(value.attack).toBe('撕咬');
    expect(value.attackRange).toBe('近战');
    expect(value.description).toBe("谨慎的灰狼");
    expect(value.experiences[0]).toEqual({ name: "追踪", bonus: "2" });
    expect(value.experiences).toHaveLength(5);
    expect(value.stress.filter(Boolean)).toHaveLength(2);
    expect(value.stressMax).toBe(5);
    expect(JSON.stringify(sheet)).toBe(before);
  });
  it("uses a positive square portrait and bounds the existing six-slot track", () => {
    expect(COMPANION_PORTRAIT.size).toBeGreaterThan(0);
    expect(
      companionPrintValues({
        ...structuredClone(defaultSheetData),
        companionStressMax: 100,
      }).stressMax,
    ).toBe(6);
  });
});
