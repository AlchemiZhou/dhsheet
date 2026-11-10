import { describe, expect, it } from 'vitest'
import { createEmptyCard, type ExtendedStandardCard } from '@/card/card-types'
import { findAncestryPair } from '@/character/ancestry/pair'
import { cleanAndNormalizeData } from '@/lib/character-data-validator'
import { resetSheetStore, sheet, store } from './automation/test-helpers'

function card(id: string, level: number, overrides: Partial<ExtendedStandardCard> = {}): ExtendedStandardCard {
  return { ...createEmptyCard('ancestry'), id, name: id, type: 'ancestry', level, class: '精灵', hint: '森林', batchId: 'pack', ...overrides }
}

describe('完整种族选择', () => {
  it('只配对同一卡包、种族和简介的第二项特性', () => {
    const first = card('first', 1)
    const second = card('second', 2)
    expect(findAncestryPair(first, [card('other-pack', 2, { batchId: 'other' }), card('other-variant', 2, { hint: '山地' }), second])).toEqual(second)
    expect(findAncestryPair(first, [second, card('duplicate', 2)])).toBeUndefined()
  })

  it('同时更新两个受保护卡槽，并在第二项无效时保留原有选择', () => {
    resetSheetStore()
    const first = card('first', 1)
    const second = card('second', 2)
    expect(store().selectAncestryPair(first, second).kind).toBe('success')
    expect(sheet().ancestry1Ref?.id).toBe('first')
    expect(sheet().ancestry2Ref?.id).toBe('second')
    expect(sheet().cards[2].id).toBe('first')
    expect(sheet().cards[3].id).toBe('second')
    expect(store().selectAncestryPair(card('new', 1), { ...second, type: 'community' }).kind).toBe('failure')
    expect(sheet().ancestry1Ref?.id).toBe('first')
    expect(sheet().ancestry2Ref?.id).toBe('second')
  })

  it('保留导入角色的混血开关，并保留旧存档的未设置状态', () => {
    expect(cleanAndNormalizeData({ mixedAncestry: true }).mixedAncestry).toBe(true)
    expect(cleanAndNormalizeData({ mixedAncestry: false }).mixedAncestry).toBe(false)
    expect(cleanAndNormalizeData({}).mixedAncestry).toBeUndefined()
  })
})
