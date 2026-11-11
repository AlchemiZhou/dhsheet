import { describe, expect, it } from 'vitest'
import base from '@/data/cards/builtin-base.json'
import expansion from '@/data/cards/builtin-hope-fear.json'
import { professionCardConverter, type ProfessionCard } from '../convert'
import { getProfessionDomains } from '../domains'

const expectedDomains: Record<string, string[]> = {
  '吟游诗人': ['优雅', '典籍'], '德鲁伊': ['贤者', '奥术'], '守护者': ['勇气', '利刃'],
  '游侠': ['贤者', '骸骨'], '游荡者': ['午夜', '优雅'], '神使': ['辉耀', '勇气'],
  '术士': ['奥术', '午夜'], '战士': ['利刃', '骸骨'], '法师': ['典籍', '辉耀'],
  '刺客': ['午夜', '利刃'], '格斗家': ['骸骨', '勇气'], '邪术师': ['恐怖', '优雅'], '灵巫': ['贤者', '恐怖'],
}

const professions = [...base.profession, ...expansion.profession] as ProfessionCard[]

describe('profession domain defaults', () => {
  it.each(Object.entries(expectedDomains))('reads the actual domains of %s', (name, expected) => {
    const raw = professions.find(card => card.名称 === name)
    expect(raw).toBeDefined()
    const card = professionCardConverter.toStandard(raw!)
    expect(getProfessionDomains(card).sort()).toEqual([...expected].sort())
  })

  it('uses custom card metadata without guessing from its profession name', () => {
    expect(getProfessionDomains({ type: 'profession', cardSelectDisplay: { item1: '星辰', item2: '潮汐' } }))
      .toEqual(['星辰', '潮汐'])
  })

  it('omits blank entries and duplicate domains', () => {
    expect(getProfessionDomains({ type: 'profession', cardSelectDisplay: { item1: ' 奥术 ', item2: '奥术' } })).toEqual(['奥术'])
    expect(getProfessionDomains({ type: 'profession', cardSelectDisplay: { item2: '  ' } })).toEqual([])
  })

  it('does not turn unrelated card labels or an empty profession into a domain restriction', () => {
    expect(getProfessionDomains({ type: 'subclass', cardSelectDisplay: { item1: '基石', item2: '本能施法' } })).toEqual([])
    expect(getProfessionDomains(undefined)).toEqual([])
    expect(getProfessionDomains(null)).toEqual([])
  })
})
