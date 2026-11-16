import { act, cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { AttributesSection } from '@/components/character-sheet-sections/attributes-section'
import { useSheetStore } from '@/lib/sheet-store'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { subclassCardConverter, type SubClassCard } from '@/card/subclass-card/convert'
import base from '@/data/cards/builtin-base.json'
import expansion from '@/data/cards/builtin-hope-fear.json'

const cards = [...base.subclass, ...expansion.subclass] as SubClassCard[]
const pick = (name: string) => {
  const card = subclassCardConverter.toStandard(cards.find(c => c.名称 === name)!)
  act(() => { useSheetStore.getState().selectCharacterChoiceCard('subclass', { id: card.id, name: card.name }, card) })
}
afterEach(cleanup)
describe('selected subclass spellcasting highlight', () => {
  it('updates immediately, switches attributes, and clears for a non-caster without changing attribute values', () => {
    useSheetStore.setState({ sheetData: structuredClone(defaultSheetData) })
    const before = Object.fromEntries(['agility','strength','finesse','instinct','presence','knowledge'].map(key => [key, (useSheetStore.getState().sheetData as any)[key].value]))
    const { container } = render(<AttributesSection />)
    const marked = () => [...container.querySelectorAll('[data-spellcasting=true]')].map(e => e.getAttribute('data-attribute'))
    pick('游唱乐手基石')
    expect(marked()).toEqual(['presence'])
    pick('毒师公会')
    expect(marked()).toEqual(['knowledge'])
    expect(container.querySelector('[data-attribute=knowledge] button[aria-pressed=true]')).not.toBeNull()
    pick('勇气呼唤基石')
    expect(marked()).toEqual([])
    for (const [key, value] of Object.entries(before)) expect((useSheetStore.getState().sheetData as any)[key].value).toBe(value)
    act(() => { useSheetStore.getState().clearCharacterChoiceCard('subclass') })
    expect(marked()).toEqual([])
  })
})
