import '@testing-library/jest-dom/vitest'
import { describe, it, expect, beforeEach } from 'vitest'
import { act, render } from '@testing-library/react'
import { createEmptyCard } from '@/card/card-types'
import { DOMAIN_COLORS, resolveSheetTheme, DEFAULT_SHEET_APPEARANCE, resolveProfessionThemeId, resolveDomainId } from '@/character/appearance/theme'
import { SheetAppearanceProvider } from '@/components/sheet-appearance-provider'
import { useSheetAppearanceStore } from '@/lib/sheet-appearance-store'
import { getAppPreferences, getSheetAppearance, setCardDisplayMode, setSheetAppearance } from '@/lib/app-preferences'
import { resetSheetStore, store } from './automation/test-helpers'

const expected = [
  ['Bard', '#8A4567', '#315F63'], ['Druid', '#416347', '#4D628A'], ['Guardian', '#526572', '#873E3E'],
  ['Ranger', '#416347', '#93602F'], ['Rogue', '#343544', '#8A4567'], ['Seraph', '#80652F', '#526572'],
  ['Sorcerer', '#4D628A', '#343544'], ['Warrior', '#873E3E', '#93602F'], ['Wizard', '#315F63', '#80652F'],
  ['Assassin', '#343544', '#873E3E'], ['Brawler', '#93602F', '#526572'], ['Warlock', '#4D3A69', '#8A4567'], ['Witch', '#416347', '#4D3A69'],
]
const profession = (id: string) => ({ ...createEmptyCard('profession'), id, name: id, type: 'profession' })

describe('职业双色主题', () => {
  beforeEach(() => { resetSheetStore(); useSheetAppearanceStore.setState({ preferences: { ...DEFAULT_SHEET_APPEARANCE } }) })
  it.each(expected)('%s 对应固定的两个领域色', (id, primary, secondary) => {
    expect(resolveSheetTheme(DEFAULT_SHEET_APPEARANCE, profession(id))).toMatchObject({ primary, secondary })
  })
  it('跨职业共享领域色，支持扩展包英文标识及领域组合，不重命名卡牌', () => {
    expect(resolveDomainId('恐怖')).toBe('dread')
    expect(resolveDomainId('恐惧')).toBe('dread')
    expect(resolveSheetTheme(DEFAULT_SHEET_APPEARANCE, profession('Bard')).primary).toBe(DOMAIN_COLORS.grace)
    expect(resolveSheetTheme(DEFAULT_SHEET_APPEARANCE, profession('Rogue')).secondary).toBe(DOMAIN_COLORS.grace)
    expect(resolveProfessionThemeId(profession('custom:profession:Witch'))).toBe('witch')
    const card = { ...profession('opaque-id'), name: '扩展包原有译名', cardSelectDisplay: { item1: '骸骨', item2: '勇气' } }
    expect(resolveProfessionThemeId(card)).toBe('brawler')
    expect(card.name).toBe('扩展包原有译名')
  })
  it('职业切换、载入快照与清空职业时自动响应，配色偏好不改变角色数值', () => {
    const { container } = render(<SheetAppearanceProvider><div /></SheetAppearanceProvider>)
    const root = () => container.querySelector<HTMLElement>('.sheet-appearance')!
    expect(root().dataset.professionTheme).toBe('neutral')
    act(() => store().setSheetData(prev => ({ ...prev, cards: [profession('Bard'), ...prev.cards.slice(1)] })))
    expect(root().style.getPropertyValue('--sheet-primary')).toBe('#8A4567')
    act(() => store().setSheetData(prev => ({ ...prev, cards: [profession('Warrior'), ...prev.cards.slice(1)] })))
    expect(root().style.getPropertyValue('--sheet-primary')).toBe('#873E3E')
    const before = JSON.stringify(store().sheetData)
    act(() => useSheetAppearanceStore.getState().update({ mode: 'profession', profession: 'warlock', printMode: 'mono' }))
    expect(root().style.getPropertyValue('--sheet-primary')).toBe('#4D3A69')
    expect(root().dataset.printMode).toBe('mono')
    expect(JSON.stringify(store().sheetData)).toBe(before)
    act(() => useSheetAppearanceStore.getState().update({ mode: 'neutral' }))
    expect(root().style.getPropertyValue('--sheet-primary')).toBe('#3D3D3D')
    act(() => { store().setSheetData(prev => ({ ...prev, cards: [createEmptyCard(), ...prev.cards.slice(1)], professionRef: undefined })); useSheetAppearanceStore.getState().update({ mode: 'auto' }) })
    expect(root().dataset.professionTheme).toBe('neutral')
  })
  it('界面偏好独立保存，其他偏好操作不会清掉主题和打印选择', () => {
    const values = new Map<string, string>()
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value) }, removeItem: (key: string) => { values.delete(key) } }
    setSheetAppearance({ mode: 'profession', profession: 'witch', printMode: 'mono' }, storage)
    setCardDisplayMode('text', storage)
    expect(getSheetAppearance(storage)).toEqual({ mode: 'profession', profession: 'witch', printMode: 'mono' })
    expect(getAppPreferences(storage).ui.cardDisplayMode).toBe('text')
  })
})
