import type { StandardCard } from '@/card/card-types'

export const DOMAIN_COLORS = {
  arcana: '#4D628A', blade: '#873E3E', bone: '#93602F', codex: '#315F63',
  grace: '#8A4567', midnight: '#343544', sage: '#416347', splendor: '#80652F',
  valor: '#526572', dread: '#4D3A69',
} as const
export type DomainId = keyof typeof DOMAIN_COLORS
export const DOMAIN_NAMES: Record<DomainId, string> = {
  arcana: '奥术', blade: '利刃', bone: '骸骨', codex: '典籍', grace: '优雅',
  midnight: '午夜', sage: '贤者', splendor: '辉耀', valor: '勇气', dread: '恐怖',
}
export const PROFESSION_THEMES = {
  bard: { name: '吟游诗人', domains: ['grace', 'codex'] },
  druid: { name: '德鲁伊', domains: ['sage', 'arcana'] },
  guardian: { name: '守护者', domains: ['valor', 'blade'] },
  ranger: { name: '游侠', domains: ['sage', 'bone'] },
  rogue: { name: '游荡者', domains: ['midnight', 'grace'] },
  seraph: { name: '神使', domains: ['splendor', 'valor'] },
  sorcerer: { name: '术士', domains: ['arcana', 'midnight'] },
  warrior: { name: '战士', domains: ['blade', 'bone'] },
  wizard: { name: '法师', domains: ['codex', 'splendor'] },
  assassin: { name: '刺客', domains: ['midnight', 'blade'] },
  brawler: { name: '格斗家', domains: ['bone', 'valor'] },
  warlock: { name: '邪术师', domains: ['dread', 'grace'] },
  witch: { name: '灵巫', domains: ['sage', 'dread'] },
} as const satisfies Record<string, { name: string; domains: readonly [DomainId, DomainId] }>
export type ProfessionThemeId = keyof typeof PROFESSION_THEMES
export interface SheetAppearancePreferences {
  mode: 'auto' | 'neutral' | 'profession'
  profession: ProfessionThemeId
  printMode: 'color' | 'mono'
}
export const DEFAULT_SHEET_APPEARANCE: SheetAppearancePreferences = { mode: 'auto', profession: 'bard', printMode: 'color' }
export function normalizeSheetAppearance(raw: unknown): SheetAppearancePreferences {
  const value = raw && typeof raw === 'object' ? raw as Partial<SheetAppearancePreferences> : {}
  return {
    mode: value.mode === 'neutral' || value.mode === 'profession' ? value.mode : 'auto',
    profession: value.profession && Object.hasOwn(PROFESSION_THEMES, value.profession) ? value.profession : 'bard',
    printMode: value.printMode === 'mono' ? 'mono' : 'color',
  }
}
export function resolveProfessionThemeId(card?: StandardCard): ProfessionThemeId | undefined {
  if (!card) return undefined
  const tokens = [card.id, card.name, card.class].flatMap(value => value?.toLowerCase().split(/[^a-z\u4e00-\u9fff]+/) ?? [])
  const ids = Object.keys(PROFESSION_THEMES) as ProfessionThemeId[]
  const exact = ids.find(id => tokens.includes(id) || tokens.includes(PROFESSION_THEMES[id].name))
  if (exact) return exact
  const domains = [card.cardSelectDisplay.item1, card.cardSelectDisplay.item2].map(value => value ? resolveDomainId(value) : undefined)
  return domains.every(Boolean) ? ids.find(id => PROFESSION_THEMES[id].domains.every(domain => domains.includes(domain))) : undefined
}
export function resolveDomainId(value: string): DomainId | undefined {
  if (value === '恐惧') return 'dread'
  return (Object.keys(DOMAIN_COLORS) as DomainId[]).find(id => id === value.toLowerCase() || DOMAIN_NAMES[id] === value)
}
export function resolveSheetTheme(preferences: SheetAppearancePreferences, card?: StandardCard) {
  const id = !card || preferences.mode === 'neutral' ? undefined : preferences.mode === 'profession' ? preferences.profession : resolveProfessionThemeId(card)
  const domains = id ? PROFESSION_THEMES[id].domains : undefined
  return { id, domains, primary: domains ? DOMAIN_COLORS[domains[0]] : '#3D3D3D', secondary: domains ? DOMAIN_COLORS[domains[1]] : '#858585' }
}
