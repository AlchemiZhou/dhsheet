import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CardArtworkToggle } from '@/components/card-artwork-toggle'
import { useCardArtworkStore } from '@/lib/card-artwork-store'
import { getCardArtworkEnabled, setCardDisplayMode } from '@/lib/app-preferences'
import { useTextModeStore } from '@/lib/text-mode-store'
import { showFadeNotification } from '@/components/ui/fade-notification'
import { ImageCard } from '@/components/ui/image-card'
import { SimpleImageCard } from '@/components/ui/simple-image-card'
import { CardHoverPreview } from '@/components/ui/card-hover-preview'
import { PrintImageCard } from '@/components/ui/print-image-card'
import { CompleteAncestryCardView } from '@/components/ui/complete-ancestry-card'
import { createCompleteAncestryCard } from '@/character/ancestry/complete-card'
import { createEmptyCard } from '@/card/card-types'
import * as imageUtils from '@/lib/utils'

vi.mock('@/components/ui/fade-notification', () => ({ showFadeNotification: vi.fn() }))
const card = {
  ...createEmptyCard('domain'),
  id: 'art-test',
  name: '测试卡牌',
  description: '仍然可以阅读的规则文字',
}
describe('card artwork preference', () => {
  beforeEach(() => {
    localStorage.clear()
    useCardArtworkStore.setState({ enabled: false })
    vi.clearAllMocks()
  })
  it('starts hidden even for old image-mode preferences, toggles with feedback and remembers both choices', () => {
    setCardDisplayMode('image')
    expect(getCardArtworkEnabled()).toBe(false)
    useTextModeStore.getState().setTextMode(true)
    const view = render(<CardArtworkToggle />)
    const button = screen.getByRole('button', { name: '由 炼金术士阿刻米 特调' })
    expect(button).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(button)
    expect(getCardArtworkEnabled()).toBe(true)
    expect(useTextModeStore.getState().isTextMode).toBe(false)
    expect(showFadeNotification).toHaveBeenLastCalledWith(
      expect.objectContaining({ message: '插图取消隐藏' }),
    )
    view.unmount()
    useCardArtworkStore.setState({ enabled: false })
    render(<CardArtworkToggle />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button'))
    expect(getCardArtworkEnabled()).toBe(false)
    expect(showFadeNotification).toHaveBeenLastCalledWith(expect.objectContaining({ message: '插图已隐藏' }))
    act(() => useCardArtworkStore.getState().hydrate())
    expect(useCardArtworkStore.getState().enabled).toBe(false)
  })
  it('does not load hidden artwork in selectors, drawers, hover previews, print cards or complete ancestries', async () => {
    const imageSpy = vi.spyOn(imageUtils, 'getCardImageUrlAsync').mockResolvedValue('/test-art.webp')
    const first = { ...card, type: 'ancestry', class: '精灵', level: 1 },
      second = { ...card, type: 'ancestry', class: '精灵', id: 'second', level: 2 }
    try {
      const { container } = render(
        <>
          <ImageCard card={card} onClick={() => {}} isSelected={false} />
          <SimpleImageCard card={card} onClick={() => {}} isSelected={false} />
          <CardHoverPreview card={card} />
          <PrintImageCard card={card} />
          <CompleteAncestryCardView card={createCompleteAncestryCard(first, second)!} />
        </>,
      )
      expect(container.querySelectorAll('img')).toHaveLength(0)
      expect(imageSpy).not.toHaveBeenCalled()
      expect(screen.getAllByText(card.description).length).toBeGreaterThan(0)
      act(() => useCardArtworkStore.getState().setEnabled(true))
      await waitFor(() => expect(container.querySelectorAll('img').length).toBeGreaterThanOrEqual(5))
      act(() => useCardArtworkStore.getState().setEnabled(false))
      expect(container.querySelectorAll('img')).toHaveLength(0)
      expect(screen.getAllByText(card.description).length).toBeGreaterThan(0)
    } finally {
      imageSpy.mockRestore()
    }
  })
})
