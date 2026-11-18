import type { SheetData } from '@/lib/sheet-data'

/** Use the saved card identities even when their source pack is no longer installed. */
export function characterExportTitle(sheet: SheetData): string {
  const label = (index: number, reference?: string) =>
    sheet.cards?.[index]?.class || sheet.cards?.[index]?.name || reference
  return [
    sheet.name || '新角色',
    label(0, sheet.professionRef?.name),
    label(2, sheet.ancestry1Ref?.name),
    sheet.mixedAncestry && label(3, sheet.ancestry2Ref?.name),
    label(4, sheet.communityRef?.name),
    'LV' + (sheet.level || '1'),
  ].filter(Boolean).join('-')
}
