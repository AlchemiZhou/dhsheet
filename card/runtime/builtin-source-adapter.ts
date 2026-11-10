import builtinCardPackJson from "@/data/cards/builtin-base.json"
import hopeFearCardPackJson from "@/data/cards/builtin-hope-fear.json"
import { CardSource, CardType } from "@/card/card-types"
import type { BatchInfo } from "@/card/stores/store-types"
import { prepareCardPackContentForRuntime } from "./prepare-card-pack-content"
import { projectCardPackModelToRuntimeTemplates } from "./runtime-card-projection"
import { CARD_BUILTIN_SOURCE_ID, type CardRuntimeSourceSnapshot } from "./source-types"

const BUILTIN_BATCH_NAME = "系统内置卡牌"

export async function loadBuiltinCardRuntimeSource(input: {
  disabledSourceIds: string[]
  installedCardIds?: ReadonlySet<string>
}): Promise<CardRuntimeSourceSnapshot> {
  const prepared = prepareCardPackContentForRuntime({ payload: builtinCardPackJson })

  if (!prepared.success) {
    throw new Error(
      `Failed to load built-in card runtime source: ${prepared.diagnostics
        .map((diagnostic) => diagnostic.message)
        .join("; ")}`,
    )
  }

  const expansion = prepareCardPackContentForRuntime({ payload: hopeFearCardPackJson })
  if (!expansion.success) {
    throw new Error(`Failed to load bundled Hope and Fear cards: ${expansion.diagnostics.map(diagnostic => diagnostic.message).join("; ")}`)
  }

  // Existing installations remain authoritative for these expansion IDs,
  // including edited cards, their images, and disabled-pack preferences.
  // Base-card conflicts still reach the assembler's duplicate-ID checks.
  const expansionCards = projectCardPackModelToRuntimeTemplates(expansion.model)
    .filter(card => !input.installedCardIds?.has(card.id))
  const cards = [...projectCardPackModelToRuntimeTemplates(prepared.model), ...expansionCards].map((card) => ({
    ...card,
    source: CardSource.BUILTIN,
    batchId: CARD_BUILTIN_SOURCE_ID,
    batchName: BUILTIN_BATCH_NAME,
    hasLocalImage: false,
  }))
  const cardTypes = Array.from(new Set(cards.map((card) => card.type ?? CardType.Domain)))
  const { definitions } = prepared.model
  const mergedDefinitions = (key: "classes" | "ancestries" | "communities" | "domains" | "variants") =>
    Array.from(new Set([...definitions[key], ...expansion.model.definitions[key]]))

  const batch: BatchInfo = {
    id: CARD_BUILTIN_SOURCE_ID,
    name: BUILTIN_BATCH_NAME,
    fileName: "builtin-base.json",
    importTime: "builtin",
    cardCount: cards.length,
    cardTypes,
    size: 0,
    isSystemBatch: true,
    disabled: input.disabledSourceIds.includes(CARD_BUILTIN_SOURCE_ID),
    cardIds: cards.map((card) => card.id),
    customFieldDefinitions: {
      professions: mergedDefinitions("classes"),
      ancestries: mergedDefinitions("ancestries"),
      communities: mergedDefinitions("communities"),
      domains: mergedDefinitions("domains"),
      variants: mergedDefinitions("variants"),
    },
    variantTypes: { ...definitions.variantTypes, ...expansion.model.definitions.variantTypes },
  }

  return { sourceId: CARD_BUILTIN_SOURCE_ID, kind: "builtin", batch, cards }
}
