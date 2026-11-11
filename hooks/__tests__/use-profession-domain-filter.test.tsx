import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CardType, type StandardCard } from '@/card/card-types'
import { useCardStore } from '@/card/stores/unified-card-store'
import { useCardFilterStore } from '@/lib/card-filter-store'
import { useSheetStore } from '@/lib/sheet-store'
import { defaultSheetData } from '@/lib/default-sheet-data'
import { useCardFiltering } from '../use-card-filtering'
import { useProfessionDomainFilter } from '../use-profession-domain-filter'

const profession = (id: string, first: string, second: string): StandardCard => ({
  standarized: true, id, name: id, class: id, type: CardType.Profession,
  cardSelectDisplay: { item1: first, item2: second },
})
const druid = profession('druid', '贤者', '奥术')
const warrior = profession('warrior', '利刃', '骸骨')
const domainCards: StandardCard[] = ['贤者', '奥术', '利刃', '骸骨'].map(domain => ({
  standarized: true, id: domain, name: `${domain}法术`, class: domain, type: CardType.Domain,
  level: 1, cardSelectDisplay: { item1: domain },
}))

function selectProfession(card?: StandardCard) {
  useSheetStore.setState(state => ({ sheetData: {
    ...state.sheetData, cards: card ? [card] : [],
    professionRef: { id: card?.id ?? '', name: card?.name ?? '' },
  } }))
}

function usePicker(isOpen: boolean, initialTab: string = CardType.Domain) {
  const filter = useCardFiltering(initialTab, isOpen)
  useProfessionDomainFilter(isOpen, filter.state.activeTab)
  return filter
}

beforeEach(() => {
  useSheetStore.setState({ sheetData: { ...defaultSheetData, cards: [] }, sheetLoadRevision: 0 })
  useCardFilterStore.setState({ activeTab: CardType.Domain, selectedBatches: [], selectedClasses: [], selectedLevels: [], searchTerm: '' })
  useCardStore.setState({
    initialized: true, loading: false, error: null, batches: new Map(),
    cards: new Map([...domainCards, druid, warrior].map(card => [card.id, card])),
    cardsByType: new Map([[CardType.Domain, domainCards.map(card => card.id)], [CardType.Profession, ['druid', 'warrior']]]),
  })
})

describe('editable profession defaults in the domain picker', () => {
  it('filters to the two selected profession domains without changing the character', () => {
    selectProfession(druid)
    const sheetBefore = useSheetStore.getState().sheetData
    const { result } = renderHook(() => usePicker(true))
    expect(result.current.state.selectedClasses).toEqual(['贤者', '奥术'])
    expect(result.current.filteredCards.map(card => card.id)).toEqual(['贤者', '奥术'])
    expect(useSheetStore.getState().sheetData).toBe(sheetBefore)
  })

  it('updates when the selected profession changes and clears restrictions when it is removed', () => {
    selectProfession(druid)
    const { result } = renderHook(() => usePicker(true))
    act(() => selectProfession(warrior))
    expect(result.current.state.selectedClasses).toEqual(['利刃', '骸骨'])
    expect(result.current.filteredCards.map(card => card.id)).toEqual(['利刃', '骸骨'])
    act(() => selectProfession())
    expect(result.current.state.selectedClasses).toEqual([])
    expect(result.current.filteredCards).toHaveLength(4)
  })

  it('keeps manual changes and reset available while the picker is open', () => {
    selectProfession(druid)
    const { result } = renderHook(() => usePicker(true))
    act(() => result.current.actions.setClasses(['利刃']))
    act(() => result.current.actions.setSearchTerm('法术'))
    expect(result.current.filteredCards.map(card => card.id)).toEqual(['利刃'])
    act(() => result.current.actions.resetAll())
    expect(result.current.state.selectedClasses).toEqual([])
    expect(result.current.filteredCards).toHaveLength(4)
  })

  it('applies defaults again on reopening, including after closing on another card type', () => {
    selectProfession(druid)
    const { result, rerender } = renderHook(({ open }) => usePicker(open), { initialProps: { open: true } })
    act(() => result.current.actions.setActiveTab(CardType.Profession))
    expect(result.current.state.selectedClasses).toEqual([])
    rerender({ open: false })
    rerender({ open: true })
    expect(result.current.state.activeTab).toBe(CardType.Domain)
    expect(result.current.state.selectedClasses).toEqual(['贤者', '奥术'])
  })

  it('leaves other card types unrestricted and restores profession defaults on returning to domains', () => {
    selectProfession(druid)
    const { result } = renderHook(() => usePicker(true))
    act(() => result.current.actions.setActiveTab(CardType.Profession))
    expect(result.current.filteredCards.map(card => card.id)).toEqual(['druid', 'warrior'])
    act(() => result.current.actions.setActiveTab(CardType.Domain))
    expect(result.current.state.selectedClasses).toEqual(['贤者', '奥术'])
  })

  it('does not allow a closed picker to change another picker’s tab or filters', () => {
    selectProfession(druid)
    useCardFilterStore.getState().setActiveTab(CardType.Subclass)
    useCardFilterStore.getState().setClasses(['自定义子职业'])
    renderHook(() => usePicker(false))
    expect(useCardFilterStore.getState().activeTab).toBe(CardType.Subclass)
    expect(useCardFilterStore.getState().selectedClasses).toEqual(['自定义子职业'])
  })

  it('restores defaults when a saved character is loaded, even with the same profession', () => {
    selectProfession(druid)
    const { result } = renderHook(() => usePicker(true))
    act(() => result.current.actions.resetAll())
    act(() => useSheetStore.setState(state => ({ sheetLoadRevision: state.sheetLoadRevision + 1 })))
    expect(result.current.state.selectedClasses).toEqual(['贤者', '奥术'])
  })

  it('keeps saved instance domains instead of applying an unaccepted template update', () => {
    selectProfession({ ...druid, cardSelectDisplay: { item1: '利刃', item2: '骸骨' } })
    const { result } = renderHook(() => usePicker(true))
    expect(result.current.state.selectedClasses).toEqual(['利刃', '骸骨'])
  })

  it('waits for card metadata when loading a reference-only profession', () => {
    useSheetStore.setState(state => ({ sheetData: { ...state.sheetData, professionRef: { id: 'druid', name: '德鲁伊' } } }))
    useCardStore.setState({ cards: new Map(), initialized: false })
    const { result } = renderHook(() => usePicker(true))
    expect(result.current.state.selectedClasses).toEqual([])
    act(() => useCardStore.setState({ cards: new Map([...domainCards, druid].map(card => [card.id, card])), initialized: true }))
    expect(result.current.state.selectedClasses).toEqual(['贤者', '奥术'])
    expect(result.current.filteredCards.map(card => card.id)).toEqual(['贤者', '奥术'])
  })

  it('does not overwrite a manual filter on unrelated character edits or catalog refreshes', () => {
    selectProfession(druid)
    const { result } = renderHook(() => usePicker(true))
    act(() => result.current.actions.setClasses(['利刃']))
    act(() => useSheetStore.setState(state => ({ sheetData: { ...state.sheetData, name: '新名称', cards: [{ ...druid }] } })))
    act(() => useCardStore.setState(state => ({ cards: new Map(state.cards) })))
    expect(result.current.state.selectedClasses).toEqual(['利刃'])
  })
})
