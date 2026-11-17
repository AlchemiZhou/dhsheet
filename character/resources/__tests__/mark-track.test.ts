import { describe, expect, it } from 'vitest'
import { markResourceTrack } from '../mark-track'
import { defaultSheetData } from '@/lib/default-sheet-data'

describe('cumulative resource track', () => {
  it.each(['hp','stress'] as const)('marks and clears %s in one update without changing the other track', field => {
    const sheet = structuredClone(defaultSheetData)
    sheet.hpMax = 12; sheet.stressMax = 12
    const marked = markResourceTrack(sheet, field, 11)
    expect(marked[field]).toEqual(Array(12).fill(true))
    expect(Object.keys(marked)).toEqual([field])
    expect(markResourceTrack({ ...sheet, ...marked }, field, 11)[field]).toEqual(Array(12).fill(false))
    expect(sheet[field]?.some(Boolean)).toBe(false)
  })
  it('does not write when a cell is disabled or an index is invalid', () => {
    const sheet = { ...structuredClone(defaultSheetData), hpMax: 6 }
    for (const index of [-1, 6, 12, 1.5, NaN]) expect(markResourceTrack(sheet, 'hp', index)).toEqual({})
  })
})
