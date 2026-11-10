import { describe, expect, it } from "vitest"
import builtinBase from "@/data/cards/builtin-base.json"
import hopeFear from "@/data/cards/builtin-hope-fear.json"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { CardSource, CardType } from "@/card/card-types"
import { CARD_BUILTIN_SOURCE_ID } from "../source-types"
import { loadBuiltinCardRuntimeSource } from "../builtin-source-adapter"
import { assembleCardRuntimeSources } from "../source-assembly"

describe("loadBuiltinCardRuntimeSource", () => {
  it("loads bundled built-in cards with compiled automation", async () => {
    const source = await loadBuiltinCardRuntimeSource({ disabledSourceIds: [] })
    const automated = source.cards.find((card) => card.automation)

    expect(source.sourceId).toBe(CARD_BUILTIN_SOURCE_ID)
    expect(source.kind).toBe("builtin")
    expect(source.batch.id).toBe(CARD_BUILTIN_SOURCE_ID)
    expect(source.batch.disabled).toBe(false)
    expect(source.cards.every((card) => card.source === CardSource.BUILTIN)).toBe(true)
    expect(automated?.automation).toEqual(expect.objectContaining({ format: "daggerheart.card-automation.ir.v1" }))
  })

  it("applies disabled state from app preferences input", async () => {
    const source = await loadBuiltinCardRuntimeSource({ disabledSourceIds: [CARD_BUILTIN_SOURCE_ID] })

    expect(source.batch.disabled).toBe(true)
  })

  it("preserves beastform cards and their selection definitions", async () => {
    const source = await loadBuiltinCardRuntimeSource({ disabledSourceIds: [] })
    const beastforms = source.cards.filter((card) => card.variantSpecial?.realType === "野兽形态")

    expect(beastforms.map((card) => card.id)).toEqual(builtinBase.variant.map((card) => card.id))
    expect(beastforms.every((card) => card.variantSpecial?.realType === "野兽形态")).toBe(true)
    expect(source.batch.variantTypes).toMatchObject(builtinBase.customFieldDefinitions.variantTypes)
    expect(source.batch.customFieldDefinitions).toMatchObject({
      professions: expect.arrayContaining(builtinBase.customFieldDefinitions.professions),
      ancestries: expect.arrayContaining(builtinBase.customFieldDefinitions.ancestries),
      communities: expect.arrayContaining(builtinBase.customFieldDefinitions.communities),
      domains: expect.arrayContaining(builtinBase.customFieldDefinitions.domains),
    })
  })

  it("includes all 352 expansion cards, four professions and six transformations without any import", async () => {
    const source = await loadBuiltinCardRuntimeSource({ disabledSourceIds: [] })
    const ids = new Set(source.cards.map(card => card.id))
    const groups = [hopeFear.profession, hopeFear.ancestry, hopeFear.community, hopeFear.subclass, hopeFear.domain, hopeFear.variant]
    const expansion = groups.flat()
    expect(expansion).toHaveLength(352)
    expect(expansion.every(card => ids.has(card.id))).toBe(true)
    expect(source.cards.filter(card => card.type === CardType.Profession)).toHaveLength(13)
    expect(source.batch.customFieldDefinitions?.professions).toEqual(expect.arrayContaining(["刺客", "格斗家", "灵巫", "邪术师"]))
    expect(source.batch.customFieldDefinitions?.domains).toContain("恐怖")
    expect(source.batch.customFieldDefinitions?.variants).toContain("转变卡")
    const transformations = source.cards.filter(card => card.variantSpecial?.realType === "转变卡")
    expect(transformations.map(card => card.name)).toEqual(["半神", "变形者", "吸血鬼", "复生者", "狼人", "鬼魂"])
    for (const card of transformations) {
      expect(card.description).toBe(hopeFear.variant.find(raw => raw.id === card.id)?.效果)
      expect(card.hasLocalImage).toBe(false)
      expect(card.imageUrl).toMatch(/^hope-fear\/[a-f0-9]+\.webp$/)
    }
  })

  it("ships all 73 image assets with Windows-safe relative file names", () => {
    const cards = [hopeFear.profession, hopeFear.ancestry, hopeFear.community, hopeFear.subclass, hopeFear.domain, hopeFear.variant].flat()
    const illustrated = cards.filter(card => card.imageUrl.startsWith("hope-fear/"))
    expect(illustrated).toHaveLength(73)
    for (const card of illustrated) {
      expect(card.imageUrl).toMatch(/^hope-fear\/[a-f0-9]{24}\.webp$/)
      const file = path.resolve("public/image", card.imageUrl)
      expect(existsSync(file)).toBe(true)
      const bytes = readFileSync(file)
      expect(bytes.subarray(0, 4).toString()).toBe("RIFF")
      expect(bytes.subarray(8, 12).toString()).toBe("WEBP")
    }
  })

  it("preserves previously imported expansion cards without duplicate runtime IDs", async () => {
    const original = await loadBuiltinCardRuntimeSource({ disabledSourceIds: [] })
    const imported = original.cards.find(card => card.name === "吸血鬼")!
    const builtin = await loadBuiltinCardRuntimeSource({ disabledSourceIds: [], installedCardIds: new Set([imported.id]) })
    const customCard = { ...imported, batchId: "existing-pack", source: CardSource.CUSTOM, description: "用户已编辑的规则内容" }
    const custom = { sourceId: "existing-pack", kind: "custom" as const, batch: { ...original.batch, id: "existing-pack", cardIds: [imported.id], disabled: true, isSystemBatch: false }, cards: [customCard] }
    const assembled = assembleCardRuntimeSources([builtin, custom])
    expect(assembled.cards.size).toBe(original.cards.length)
    expect(assembled.cards.get(imported.id)).toBe(customCard)
    expect(assembled.batches.get("existing-pack")?.disabled).toBe(true)
    // Removing that import makes the bundled original available again.
    expect(original.cards.find(card => card.id === imported.id)?.description).not.toBe(customCard.description)
    // Only expansion ownership is resolved: base duplicates still fail loudly.
    const baseId = builtinBase.profession[0].id
    const base = await loadBuiltinCardRuntimeSource({ disabledSourceIds: [], installedCardIds: new Set([baseId]) })
    expect(base.cards.some(card => card.id === baseId)).toBe(true)
  })
})
