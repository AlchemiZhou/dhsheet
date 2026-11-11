import { describe, expect, it } from "vitest";
import { defaultSheetData } from "@/lib/default-sheet-data";
import {
  professionCardConverter,
  type ProfessionCard,
} from "@/card/profession-card/convert";
import base from "@/data/cards/builtin-base.json";
import expansion from "@/data/cards/builtin-hope-fear.json";
import { applyProfessionPreset } from "../actions";
import { PROFESSION_PRESETS, resolveProfessionPresetId } from "../catalog";
import { createProfessionStory } from "../story";
import { referenceValues } from "@/character/print-reference/model";
import { migrateSheetData } from "@/lib/sheet-data-migration";
import {
  getProfessionAutoSetup,
  setProfessionAutoSetup,
  getReferencePrint,
  setReferencePrint,
} from "@/lib/app-preferences";
const professions = [
  ...base.profession,
  ...expansion.profession,
] as ProfessionCard[];

describe("profession presets from supplied PDFs", () => {
  it.each(Object.keys(PROFESSION_PRESETS))(
    "matches %s questions, attributes and equipment",
    (id) => {
      const preset = PROFESSION_PRESETS[id as keyof typeof PROFESSION_PRESETS];
      const raw = professions.find((card) => card.名称 === preset.name)!;
      const card = professionCardConverter.toStandard(raw);
      expect(resolveProfessionPresetId(card)).toBe(id);
      const data = applyProfessionPreset(
        structuredClone(defaultSheetData),
        card,
        true,
      );
      for (const [key, value] of Object.entries(preset.attributes))
        expect(Number(data[key as "agility"]!.value)).toBe(Number(value));
      expect(data.equipment.armorSlot.name).toBeTruthy();
      const printed = referenceValues(data);
      for (const [slot, key] of [
        ["primary", "main"],
        ["secondary", "off"],
      ] as const) {
        // The app labels secondary-only equipment "副手"; the reference uses "单手".
        expect(printed[`${key}.use`].replace("副手", "单手")).toBe(
          preset.weapons[slot].trait,
        );
        expect(printed[`${key}.damage`]).toBe(preset.weapons[slot].damage);
      }
      expect(
        data.professionStory?.background.every((entry) => entry.question),
      ).toBe(true);
      expect(
        data.professionStory?.connections.every((entry) => entry.question),
      ).toBe(true);
    },
  );
  it("keeps manual attributes and equipment when matching is disabled", () => {
    const source = structuredClone(defaultSheetData);
    source.agility!.value = "9";
    source.equipment.weaponSlots.primary.name = "旧武器";
    const card = professionCardConverter.toStandard(
      professions.find((card) => card.名称 === "德鲁伊")!,
    );
    const result = applyProfessionPreset(source, card, false);
    expect(result.agility!.value).toBe("9");
    expect(result.equipment).toBe(source.equipment);
    expect(result.professionStory?.background[0].question).toContain("社群");
  });
  it("replaces question descriptions on profession changes while preserving answers", () => {
    const druid = professionCardConverter.toStandard(
      professions.find((card) => card.名称 === "德鲁伊")!,
    );
    const warrior = professionCardConverter.toStandard(
      professions.find((card) => card.名称 === "战士")!,
    );
    const old = createProfessionStory(druid);
    old.background[0].answer = "重要的旧回答";
    const next = createProfessionStory(warrior, old);
    expect(next.background[0].question).not.toBe(old.background[0].question);
    expect(next.background[0].answer).toBe("重要的旧回答");
  });
  it("round-trips editable descriptions and answers and retains legacy notes", () => {
    const source = {
      ...structuredClone(defaultSheetData),
      characterBackground: "旧简介",
      professionStory: {
        professionId: "custom",
        background: [{ question: "自定义问题", answer: "回答" }],
        connections: [],
      },
    };
    const result = migrateSheetData(source);
    expect(result.characterBackground).toBe("旧简介");
    expect(result.professionStory?.background[0]).toEqual({
      question: "自定义问题",
      answer: "回答",
    });
    expect(result.professionStory?.connections).toHaveLength(3);
  });
  it("defaults both settings on, persists them independently of display settings", () => {
    localStorage.clear();
    expect(getProfessionAutoSetup()).toBe(true);
    expect(getReferencePrint()).toBe(true);
    setProfessionAutoSetup(false);
    setReferencePrint(false);
    expect(getProfessionAutoSetup()).toBe(false);
    expect(getReferencePrint()).toBe(false);
    setReferencePrint(true);
    expect(getProfessionAutoSetup()).toBe(false);
  });
});
