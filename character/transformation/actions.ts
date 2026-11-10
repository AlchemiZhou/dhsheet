import { isEmptyCard, type StandardCard } from '@/card/card-types'
import type { SheetData } from '@/lib/sheet-data'
import { deleteCardInstance, replaceCardInstance, selectCardIntoSlot, type CardAutomationActionResult } from '@/automation/actions/card-actions'

const TRANSFORMATION_TYPES = new Set(['转变', '转变卡', '转换', '转换卡', 'transformation', 'transformations'])
export function isTransformationCard(card: StandardCard): boolean {
  return card.type === 'variant' && TRANSFORMATION_TYPES.has((card.variantSpecial?.realType ?? '').trim().toLowerCase())
}
function location(sheet: SheetData) {
  if (!sheet.transformationInstanceId) return undefined
  for (const zone of ['loadout', 'vault'] as const) {
    const cards = zone === 'loadout' ? sheet.cards : sheet.inventory_cards ?? []
    const index = cards.findIndex(card => card.instanceId === sheet.transformationInstanceId && isTransformationCard(card))
    if (index >= 0) return { zone, index, card: cards[index] }
  }
  return undefined
}
export function getSelectedTransformationCard(sheet: SheetData): StandardCard | undefined {
  return sheet.transformationEnabled ? location(sheet)?.card : undefined
}
export function setTransformationMode(sheet: SheetData, enabled: boolean): CardAutomationActionResult {
  const selected = location(sheet)
  const removed = !enabled && selected ? deleteCardInstance(sheet, selected.zone, selected.index) : { kind: 'success' as const, sheetData: sheet, effects: [] }
  if (removed.kind === 'failure') return removed
  return { ...removed, sheetData: { ...removed.sheetData, transformationEnabled: enabled, transformationInstanceId: enabled ? sheet.transformationInstanceId : undefined } }
}
export function selectTransformation(sheet: SheetData, template?: StandardCard): CardAutomationActionResult {
  if (template && !isTransformationCard(template)) return { kind: 'failure', sheetData: sheet, message: '请选择转变卡。' }
  if (!template) {
    const removed = setTransformationMode(sheet, false)
    return removed.kind === 'failure' ? removed : { ...removed, sheetData: { ...removed.sheetData, transformationEnabled: true } }
  }
  const selected = location(sheet)
  const index = selected?.zone === 'loadout' ? selected.index : Array.from({ length: 15 }, (_, i) => i + 5).find(i => !sheet.cards[i] || isEmptyCard(sheet.cards[i]))
  if (index === undefined) return { kind: 'failure', sheetData: sheet, message: '聚焦卡组已满，请先移除一张普通卡牌。' }
  const removed = selected?.zone === 'vault' ? deleteCardInstance(sheet, 'vault', selected.index) : { kind: 'success' as const, sheetData: sheet, effects: [] }
  if (removed.kind === 'failure') return removed
  const result = selected?.zone === 'loadout' ? replaceCardInstance(removed.sheetData, 'loadout', index, template) : selectCardIntoSlot(removed.sheetData, 'loadout', index, template)
  if (result.kind === 'failure') return { ...result, sheetData: sheet }
  return { ...result, sheetData: { ...result.sheetData, transformationEnabled: true, transformationInstanceId: result.cardInstanceId } }
}
