import { isEmptyCard } from "@/card/card-types"
import type { SheetData } from "@/lib/sheet-data"

/** The first slot is the profession already printed on the character sheet. */
export function getPrintableCards(sheet: Pick<SheetData, "cards" | "inventory_cards">) {
  return [...(sheet.cards ?? []).slice(1), ...(sheet.inventory_cards ?? [])]
    .filter(card => card && !isEmptyCard(card))
}
