import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardGrid } from '@/components/modals/display/CardGrid'
import { createEmptyCard } from '@/card/card-types'

const card = { ...createEmptyCard('subclass'), id: 'druid-renewal', name: '繁茂结社基石', headerDisplay: '繁茂结社', level: 1,
  cardSelectDisplay: { item1: '德鲁伊', item2: '基石', item3: '本能' }, description: '基石之力：此处的规则原文保留。' }

describe('subclass picker presentation', () => {
  it.each([false, true])('hides generated suffix and badge in picker text mode %s, preserving rules and source data', isTextMode => {
    const original = structuredClone(card)
    render(<CardGrid cards={[card]} isTextMode={isTextMode} />)
    expect(screen.getByRole('heading', { name: '繁茂结社' })).toBeInTheDocument()
    expect(screen.queryByText('基石', { exact: true })).not.toBeInTheDocument()
    expect(screen.queryByText('繁茂结社基石', { exact: true })).not.toBeInTheDocument()
    expect(screen.getByText(/此处的规则原文保留/)).toBeInTheDocument()
    expect(card).toEqual(original)
  })
})
