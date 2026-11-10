import '@testing-library/jest-dom/vitest'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createEmptyCard, type StandardCard } from '@/card/card-types'
import { isTransformationCard, getSelectedTransformationCard } from '@/character/transformation/actions'
import { normalizeCurrentSheetData } from '@/lib/sheet-data-migration'
import { cleanAndNormalizeData, validateSheetData } from '@/lib/character-data-validator'
import { CharacterSheetPageFour } from '@/components/character-sheet-page-card-print'
import { useTextModeStore } from '@/lib/text-mode-store'
import { resetSheetStore, sheet, store } from './automation/test-helpers'

const template: StandardCard = { ...createEmptyCard('variant'), id: 'test-transformation', name: '测试转变', type: 'variant', description: '测试用卡，不属于扩展包正式内容。', variantSpecial: { realType: 'Transformation' } }
describe('转变选择与导出', () => {
  it('默认关闭；选择时加入一张可导出的聚焦卡，更换时只保留一张', () => {
    resetSheetStore()
    expect(sheet().transformationEnabled).toBe(false)
    expect(store().selectTransformationCard(template).kind).toBe('success')
    expect(getSelectedTransformationCard(sheet())?.name).toBe('测试转变')
    expect(sheet().cards.filter(isTransformationCard)).toHaveLength(1)
    store().selectTransformationCard({ ...template, id: 'replacement', name: '替换转变' })
    expect(sheet().cards.filter(isTransformationCard)).toHaveLength(1)
    expect(getSelectedTransformationCard(sheet())?.id).toBe('replacement')
    useTextModeStore.getState().setTextMode(true)
    render(<CharacterSheetPageFour />)
    expect(screen.getAllByText('替换转变')).toHaveLength(1)
  })
  it('关闭转变会移除对应卡牌，撤销已有自动效果，其他卡保留', () => {
    resetSheetStore({ stressMax: 6 })
    store().selectTransformationCard({ ...template, automation: { format: 'daggerheart.card-automation.ir.v1', revision: 'test', abilities: [{ id: 'effect', label: '测试', lifetime: { kind: 'whileInLoadout' }, effects: [{ kind: 'emitModifier', id: 'stress', target: 'stressMax', value: 1 }] }] } })
    expect(sheet().stressMax).toBe(7)
    expect(store().setTransformationEnabled(false).kind).toBe('success')
    expect(sheet().stressMax).toBe(6)
    expect(sheet().cards.filter(isTransformationCard)).toHaveLength(0)
    expect(getSelectedTransformationCard(sheet())).toBeUndefined()
  })
  it('迁移与导入保留卡牌实例引用，缺失开关默认关闭，非法类型被拒绝', () => {
    resetSheetStore(); store().selectTransformationCard(template)
    const restored = normalizeCurrentSheetData(JSON.parse(JSON.stringify(sheet())))
    expect(getSelectedTransformationCard(restored)?.id).toBe(template.id)
    expect(cleanAndNormalizeData(restored).transformationInstanceId).toBe(sheet().transformationInstanceId)
    expect(normalizeCurrentSheetData({}).transformationEnabled).toBe(false)
    expect(validateSheetData({ ...sheet(), transformationEnabled: 'yes' })).toBe(false)
    const before = sheet()
    expect(store().selectTransformationCard({ ...template, type: 'profession' }).kind).toBe('failure')
    expect(sheet()).toBe(before)
  })
  it('卡组已满时失败并保留原数据', () => {
    resetSheetStore({ cards: Array.from({ length: 20 }, (_, i) => ({ ...createEmptyCard('domain'), id: `filled-${i}`, name: `卡${i}`, type: 'domain' })) })
    const before = sheet()
    expect(store().selectTransformationCard(template).kind).toBe('failure')
    expect(sheet()).toBe(before)
  })
})
