import { describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { createEmptyCard, type ExtendedStandardCard } from '@/card/card-types'
import { createCompleteAncestryCard, getSheetAncestryCard } from '@/character/ancestry/complete-card'
import { CardGrid } from '@/components/modals/display/CardGrid'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { CardDeckSection } from '@/components/character-sheet-page-two-sections/card-deck-section'
import { resetSheetStore, sheet, store } from './automation/test-helpers'
import { useCardStore } from '@/card/stores/unified-card-store'
import * as imageUtils from '@/lib/utils'
import { useCardArtworkStore } from '@/lib/card-artwork-store'

const first: ExtendedStandardCard = { ...createEmptyCard('ancestry'), type: 'ancestry', id: 'first', name: '敏锐感知', class: '精灵', hint: '森林之子', level: 1, batchId: 'pack', description: '你能察觉细微的变化。' }
const second: ExtendedStandardCard = { ...first, id: 'second', name: '精灵休眠', level: 2, description: '你可以通过冥想休息。' }

describe('完整种族卡', () => {
  it('展示完整插图，按原比例伸展且不裁切', async () => {
    useCardArtworkStore.setState({enabled:true})
    const imageSpy = vi.spyOn(imageUtils, 'getCardImageUrlAsync').mockResolvedValue('/test-illustration.png')
    try {
      render(<CardGrid cards={[createCompleteAncestryCard({ ...first, imageUrl: '/elf.webp' }, second)!]} isTextMode={false} />)
      const image = await screen.findByRole('img', { name: '精灵种族插图' })
      expect(image).toHaveAttribute('src', '/test-illustration.png')
      expect(image).toHaveClass('h-auto', 'object-contain')
    } finally { imageSpy.mockRestore(); act(() => useCardArtworkStore.setState({enabled:false})) }
  })
  it('将同种族两项特性投影为一张卡，保留原始卡且不合并自动效果', () => {
    const card = createCompleteAncestryCard(first, second)!
    expect(card.name).toBe('精灵')
    expect(card.id).toBe(first.id)
    expect(card.ancestryTraits).toEqual([first, second])
    expect(card.description).toContain(first.description)
    expect(card.description).toContain(second.description)
    expect(first.name).toBe('敏锐感知')
    expect(createCompleteAncestryCard(first, { ...second, batchId: 'other' })).toBeUndefined()
  })

  it('关闭混血时展示一张完整卡，开启混血或不同种族时保持独立', () => {
    const sheet = { ...defaultSheetData, cards: [createEmptyCard(), createEmptyCard(), first, second] }
    expect(getSheetAncestryCard(sheet)?.name).toBe('精灵')
    expect(getSheetAncestryCard({ ...sheet, mixedAncestry: true })).toBeUndefined()
    expect(getSheetAncestryCard({ ...sheet, cards: [...sheet.cards.slice(0, 3), { ...second, class: '人类' }] })).toBeUndefined()
  })

  it('图片模式也直接展示双特性卡，并返回原第一特性ID供选择', () => {
    const onClick = vi.fn()
    render(<CardGrid cards={[createCompleteAncestryCard(first, second)!]} isTextMode={false} onCardClick={onClick} />)
    expect(screen.getByText(first.description!)).toBeInTheDocument()
    expect(screen.getByText(second.description!)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '选择精灵，包含两项种族特性' }))
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ id: first.id }))
  })

  it('角色卡牌区合并展示种族，混血开启后恢复两个独立卡位', () => {
    useCardStore.setState({ initialized: true, loading: false })
    resetSheetStore()
    store().selectAncestryPair(first, second)
    const selected = sheet()
    const { rerender } = render(<CardDeckSection formData={selected} />)
    expect(screen.getByText('精灵')).toBeInTheDocument()
    expect(screen.queryByText('种族二')).not.toBeInTheDocument()
    expect(screen.getByText(first.name)).toBeInTheDocument()
    expect(screen.getByText(second.name)).toBeInTheDocument()
    rerender(<CardDeckSection formData={{ ...selected, mixedAncestry: true }} />)
    expect(screen.getByText('种族一')).toBeInTheDocument()
    expect(screen.getByText('种族二')).toBeInTheDocument()
    expect(sheet().cards[2].id).toBe(first.id)
    expect(sheet().cards[3].id).toBe(second.id)
  })
})
import '@testing-library/jest-dom/vitest'
