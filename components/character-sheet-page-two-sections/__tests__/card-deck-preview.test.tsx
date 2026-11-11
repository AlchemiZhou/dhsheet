import '@testing-library/jest-dom/vitest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CardDeckSection } from '../card-deck-section'
import { createEmptyCard } from '@/card/card-types'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { useCardStore } from '@/card/stores/unified-card-store'

const viewport = vi.hoisted(() => ({ mobile: false }))
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => viewport.mobile }))
vi.mock('@/components/ui/card-hover-preview', () => ({
  CardHoverPreview: () => <div role="status" aria-label="卡牌预览" />,
}))
vi.mock('@/components/modals/card-selection-modal', () => ({
  CardSelectionModal: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div role="dialog" aria-label="选择领域卡">
        <button onClick={onClose}>关闭选卡</button>
      </div>
    ) : null,
}))
const sheet = {
  ...structuredClone(defaultSheetData),
  cards: Array.from({ length: 20 }, (_, i) =>
    i === 8
      ? {
          ...createEmptyCard('domain'),
          type: 'domain',
          id: 'test-domain',
          name: '测试领域卡',
          description: '卡牌说明',
        }
      : createEmptyCard(),
  ),
}
const card = () => screen.getByText('测试领域卡').closest('.h-16')!
describe('card deck preview input handling', () => {
  beforeEach(() => {
    viewport.mobile = false
    useCardStore.setState({ initialized: false, loading: false })
  })
  it('ignores compatibility mouse events on phones when tapping an already selected card', () => {
    viewport.mobile = true
    render(<CardDeckSection formData={sheet} />)
    fireEvent.pointerEnter(card(), { pointerType: 'touch' })
    fireEvent.mouseEnter(card())
    fireEvent.click(card())
    expect(screen.getByRole('dialog', { name: '选择领域卡' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: '卡牌预览' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('关闭选卡'))
    expect(screen.queryByRole('status', { name: '卡牌预览' })).not.toBeInTheDocument()
  })
  it('keeps mouse previews on desktop and clears them when the picker opens and closes', () => {
    render(<CardDeckSection formData={sheet} />)
    fireEvent.pointerEnter(card(), { pointerType: 'mouse' })
    expect(screen.getByRole('status', { name: '卡牌预览' })).toBeInTheDocument()
    fireEvent.click(card())
    expect(screen.getByRole('dialog', { name: '选择领域卡' })).toBeInTheDocument()
    expect(screen.queryByRole('status', { name: '卡牌预览' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('关闭选卡'))
    expect(screen.queryByRole('status', { name: '卡牌预览' })).not.toBeInTheDocument()
  })
  it('ignores touch and pen hover on wide touchscreens and clears previews when switching to mobile', () => {
    const { rerender } = render(<CardDeckSection formData={sheet} />)
    for (const pointerType of ['touch', 'pen']) {
      fireEvent.pointerEnter(card(), { pointerType })
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    }
    fireEvent.pointerEnter(card(), { pointerType: 'mouse' })
    expect(screen.getByRole('status')).toBeInTheDocument()
    viewport.mobile = true
    rerender(<CardDeckSection formData={sheet} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
