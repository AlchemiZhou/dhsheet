import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createEmptyCard } from '@/card/card-types'
import { CharacterSheetPageFour } from '@/components/character-sheet-page-card-print'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { useSheetStore } from '@/lib/sheet-store'
import { useTextModeStore } from '@/lib/text-mode-store'

afterEach(cleanup)
describe('combined card sheets', () => {
  it.each([
    [0, 0, []], [0, 3, [3]], [4, 5, [9]], [4, 6, [9, 1]], [9, 9, [9, 9]], [19, 20, [9, 9, 9, 9, 3]],
  ] as const)('prints %i loadout and %i vault cards in slot order', (loadout, vault, counts) => {
    const makeCards = (length: number, prefix: string) => Array.from({ length }, (_, i) => ({
      ...createEmptyCard('domain'), id: prefix + i, name: prefix + i,
    }))
    const active = makeCards(loadout, '聚焦'), inventory = makeCards(vault, '库存')
    const sheet = { ...defaultSheetData, cards: [...makeCards(1, '职业'), ...active, createEmptyCard()], inventory_cards: inventory }
    useSheetStore.setState({ sheetData: sheet })
    useTextModeStore.setState({ isTextMode: true })
    const { container } = render(<CharacterSheetPageFour />)
    const pages = Array.from(container.querySelectorAll('.printed-card-sheet'))
    expect(pages.map(page => page.querySelectorAll('.card-item-text').length)).toEqual(counts)
    const items = Array.from(container.querySelectorAll('.card-item-text'))
    expect(items).toHaveLength(active.length + inventory.length)
    const expected = [...active, ...inventory]
    expected.forEach((card, index) => expect(items[index].textContent).toContain(card.name))
  })
})
