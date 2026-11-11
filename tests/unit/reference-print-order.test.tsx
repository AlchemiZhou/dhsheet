import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import { PrintPageRenderer } from '@/components/print/print-page-renderer'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { professionCardConverter, type ProfessionCard } from '@/card/profession-card/convert'
import base from '@/data/cards/builtin-base.json'

vi.mock('@/lib/page-registry', () => ({
  getVisiblePages: () => [
    { id: 'page1', printClass: 'page-one', component: () => <div>旧第一页</div> },
    { id: 'page2', printClass: 'page-two', component: () => <div>旧第二页</div> },
    { id: 'focused-cards', printClass: 'page-four', component: () => <div>现有卡牌页</div> },
  ],
}))
vi.mock('@/components/print/reference-sheet', () => ({ ReferenceSheet: ({ page }: { page: number }) => <div>彩色模板 {page}</div> }))

describe('reference print document order', () => {
  it('retains cards as page three and appends preserved old notes after them', () => {
    const sheet = structuredClone(defaultSheetData)
    sheet.cards = [professionCardConverter.toStandard((base.profession as ProfessionCard[]).find(card => card.名称 === '德鲁伊')!)]
    sheet.characterBackground = '旧存档中的重要记忆'
    const { container, rerender } = render(<PrintPageRenderer sheetData={sheet} />)
    const root = container.firstElementChild!
    expect(Array.from(root.children).map(child => child.className.split(' ')[0])).toEqual(['page-one', 'page-two', 'page-four', 'reference-continuation'])
    expect(root.lastElementChild?.textContent).toContain('旧存档中的重要记忆')
    expect(root.lastElementChild?.classList.contains('last-printed-page')).toBe(true)
    expect(root.querySelector('.page-four')?.classList.contains('last-printed-page')).toBe(false)
    rerender(<PrintPageRenderer sheetData={{ ...sheet, characterBackground: '' }} />)
    expect(root.querySelector('.reference-continuation')).toBeNull()
    expect(root.querySelector('.page-four')?.classList.contains('last-printed-page')).toBe(true)
  })
})
