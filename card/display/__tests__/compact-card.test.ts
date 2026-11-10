import { describe, expect, it } from "vitest"
import { createEmptyCard } from "@/card/card-types"
import { getCompactCardTitle, getCompactCardTier } from "../compact-card"

const foundation = { ...createEmptyCard("subclass"), name: "游唱乐手基石", headerDisplay: "游唱乐手", level: 1, cardSelectDisplay: { item2: "基石" }, description: "这段规则原文包含基石，必须保留。" }

describe("compact subclass presentation", () => {
  it("removes the generated foundation title suffix and tier badge without mutating the card", () => {
    const original = structuredClone(foundation)
    expect(getCompactCardTitle(foundation)).toBe("游唱乐手")
    expect(getCompactCardTier(foundation)).toBe("")
    expect(foundation).toEqual(original)
  })

  it("preserves foundation when it belongs to the actual subclass name or another card", () => {
    expect(getCompactCardTitle({ ...foundation, name: "基石守护者基石", headerDisplay: "基石守护者" })).toBe("基石守护者")
    expect(getCompactCardTitle({ ...foundation, name: "大地基石", headerDisplay: "大地基石" })).toBe("大地基石")
    expect(getCompactCardTitle({ ...foundation, type: "domain" })).toBe(foundation.name)
    expect(getCompactCardTitle({ ...foundation, headerDisplay: undefined })).toBe(foundation.name)
  })

  it("preserves specialization and mastery tiers", () => {
    for (const [level, tier] of [[2, "专精"], [3, "大师"]] as const) {
      const card = { ...foundation, level, name: `游唱乐手${tier}`, cardSelectDisplay: { item2: tier } }
      expect(getCompactCardTitle(card)).toBe(card.name)
      expect(getCompactCardTier(card)).toBe(tier)
    }
  })
})
