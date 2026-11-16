import { render, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PrintPageRenderer } from '@/components/print/print-page-renderer'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { professionCardConverter, type ProfessionCard } from '@/card/profession-card/convert'
import { processCardDescription } from '@/card/card-types'
import base from '@/data/cards/builtin-base.json'

vi.mock('@/character/profession-setup/preferences', () => ({ useProfessionSetupPreferences: (select: any) => select({ referencePrint: false }) }))
vi.mock('@/lib/page-registry', () => ({ getVisiblePages: () => [
  { id: 'page1', printClass: 'page-one', component: () => <div>完整在线布局</div> },
  { id: 'page2', printClass: 'page-two', component: () => <div>完整在线布局</div> },
] }))
vi.mock('@/components/print/reference-sheet', () => ({ ReferenceSheet: () => <div data-native-layout /> }))
afterEach(cleanup)
const sheet = () => {
  const value = structuredClone(defaultSheetData)
  value.cards = [professionCardConverter.toStandard((base.profession as ProfessionCard[]).find(c => c.名称 === '战士')!)]
  return value
}
describe('explicit reference snapshot layout', () => {
  it('overrides only the current render, preserving the normal PDF preference', () => {
    const value = sheet(), { container, rerender } = render(<PrintPageRenderer sheetData={value} />)
    expect(container.querySelectorAll('[data-native-layout]')).toHaveLength(0)
    rerender(<PrintPageRenderer sheetData={value} referencePrint />)
    expect(container.querySelectorAll('[data-native-layout]')).toHaveLength(2)
    rerender(<PrintPageRenderer sheetData={value} />)
    expect(container.querySelectorAll('[data-native-layout]')).toHaveLength(0)
  })
  it('still preserves custom profession rules instead of replacing them with a builtin template', () => {
    const value = sheet()
    value.cards![0].description = processCardDescription('我的自定义职业规则')
    const { container } = render(<PrintPageRenderer sheetData={value} referencePrint />)
    expect(container.querySelectorAll('[data-native-layout]')).toHaveLength(0)
    expect(container.textContent).toContain('完整在线布局')
  })
})
