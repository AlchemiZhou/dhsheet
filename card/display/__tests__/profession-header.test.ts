import { describe, expect, it } from "vitest";
import { createEmptyCard } from "@/card/card-types";
import { PROFESSION_PRESETS } from "@/character/profession-setup/catalog";
import { getProfessionHeaderDisplay } from "../profession-header";

describe("shared profession header identity", () => {
  it("uses the original banner for each of the thirteen stock professions", () => {
    for (const [id, preset] of Object.entries(PROFESSION_PRESETS)) {
      const card = {
        ...createEmptyCard("profession"),
        id,
        class: preset.name,
        name: preset.name,
      };
      expect(getProfessionHeaderDisplay(card, card.name)).toEqual({
        title: preset.name,
        nativeId: id,
      });
      expect(
        getProfessionHeaderDisplay(card, card.name + "  -  领域信息"),
      ).toEqual({ title: preset.name, nativeId: id });
    }
  });
  it("retains a renamed or custom profession rather than showing the stock title", () => {
    const card = {
      ...createEmptyCard("profession"),
      id: "bard",
      class: "吟游诗人",
      name: "吟游诗人",
    };
    expect(getProfessionHeaderDisplay(card, "自定义称号")).toEqual({
      title: "自定义称号",
      nativeId: undefined,
    });
    const custom = {
      ...card,
      id: "custom-profession",
      class: "自定义职业",
      name: "自定义职业",
    };
    expect(getProfessionHeaderDisplay(custom, custom.name)).toEqual({
      title: custom.name,
      nativeId: undefined,
    });
  });
  it("clears the native banner when the profession is cleared", () => {
    expect(getProfessionHeaderDisplay(undefined, undefined)).toEqual({
      title: undefined,
      nativeId: undefined,
    });
  });
});
