import type { SheetData } from "@/lib/sheet-data"
import type { ModifierTargetId } from "./types"
import { CHARACTER_RESOURCE_LIMIT, limitCharacterResourceMax } from "@/character/resources/limits"

export function applyHpStressMaxInvariant(sheetData: SheetData, target: ModifierTargetId): SheetData {
  if (target !== "hpMax" && target !== "stressMax") return sheetData

  const field = target === "hpMax" ? "hp" : "stress"
  const storedMax = sheetData[target]
  const parsedMax = storedMax === "" ? NaN : Number(storedMax)
  const max = Number.isFinite(parsedMax) ? limitCharacterResourceMax(target, parsedMax) : CHARACTER_RESOURCE_LIMIT
  const next = parsedMax > CHARACTER_RESOURCE_LIMIT ? { ...sheetData, [target]: max } : sheetData

  const current = sheetData[field]
  if (!Array.isArray(current) || current.every((checked, index) => !checked || index < max)) return next

  return {
    ...next,
    [field]: current.map((checked, index) => checked && index < max),
  }
}
