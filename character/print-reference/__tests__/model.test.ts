import { describe, expect, it } from "vitest";
import { defaultSheetData } from "@/lib/default-sheet-data";
import {
  referenceCheckValue,
  referenceFieldLabel,
  referenceValues,
} from "../model";

describe("reference PDF value projection", () => {
  it("prints live equipment, signed attributes and edited stories without changing the character", () => {
    const sheet = structuredClone(defaultSheetData);
    sheet.agility = { value: "2", checked: true };
    sheet.strength = { value: "-1", checked: false };
    sheet.experience[0] = "保护森林";
    sheet.experienceValues![0] = "2";
    sheet.equipment.weaponSlots.primary = {
      name: "短杖",
      trait: "魔法/单手/近距离",
      damage: "本能:d8+1",
      feature: "自定义特性",
      modifierContributions: [],
    };
    sheet.professionStory = {
      professionId: "custom",
      background: [{ question: "改写的问题", answer: "我的回答" }],
      connections: [{ question: "关系", answer: "我的同伴" }],
    };
    const before = JSON.stringify(sheet);
    const values = referenceValues(sheet);
    expect(values["total.agility"]).toBe("+2");
    expect(values["total.strength"]).toBe("-1");
    expect(values["exp.1.bonus"]).toBe("+2");
    expect(values["main.use"]).toBe("本能 · 近距离 · 单手");
    expect(values["main.damage"]).toBe("d8+1 魔法");
    expect(values["background.1"]).toBe("我的回答");
    expect(values["relationship.1"]).toBe("我的同伴");
    expect(JSON.stringify(sheet)).toBe(before);
  });

  it("keeps resource, attribute and repeated upgrade marks distinct", () => {
    const sheet = structuredClone(defaultSheetData);
    sheet.hp![11] = true;
    sheet.stress![10] = true;
    sheet.armorBoxes![1] = true;
    sheet.agility!.checked = true;
    sheet.upgradeStates = { "tier2-7-1": { checked: true } };
    expect(referenceCheckValue("track.hp.12", sheet)).toBe(true);
    expect(referenceCheckValue("track.stress.11", sheet)).toBe(true);
    expect(referenceCheckValue("track.armor.2", sheet)).toBe(true);
    expect(referenceCheckValue("mark.agility", sheet)).toBe(true);
    expect(referenceCheckValue("guide.3.prof.2", sheet)).toBe(true);
    expect(referenceCheckValue("guide.3.prof.1", sheet)).toBe(false);
  });

  it("uses readable Chinese labels for continuation fields", () => {
    expect(referenceFieldLabel("2:background.1")).toBe("背景回答 1");
    expect(referenceFieldLabel("1:main.feature")).toBe("主武器补充内容");
    expect(referenceFieldLabel("question:connections:0")).toBe("关系描述");
  });
});
