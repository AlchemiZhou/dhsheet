import type { SheetData } from "@/lib/sheet-data";
import { CHARACTER_RESOURCE_LIMIT } from "./limits";

/** Shared cumulative track interaction; the store applies health invariants. */
export function markResourceTrack(
  sheet: SheetData,
  field: "hp" | "stress",
  index: number,
): Partial<SheetData> {
  const max = Math.max(
    0,
    Math.min(
      CHARACTER_RESOURCE_LIMIT,
      Number(sheet[field === "hp" ? "hpMax" : "stressMax"]) || 0,
    ),
  );
  if (!Number.isInteger(index) || index < 0 || index >= max) return {};
  const values = Array.from({ length: CHARACTER_RESOURCE_LIMIT }, (_, i) =>
    Boolean(sheet[field]?.[i]),
  );
  const clear = values.lastIndexOf(true) === index;
  return { [field]: values.map((_, i) => !clear && i <= index) };
}
