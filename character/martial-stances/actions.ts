import { getCharacterTier, parseCharacterLevel } from '@/character/progression/tiers'
import type { SheetData } from '@/lib/sheet-data'
import { MARTIAL_STANCES, MAX_FOCUS, type MartialStanceId } from './catalog'
import type { MartialStancesState } from './state'

export type MartialStanceAction =
  | { type: 'learn'; id: MartialStanceId }
  | { type: 'activate'; id: MartialStanceId }
  | { type: 'drop' }
  | { type: 'focus'; value: number }
export type MartialStanceActionResult = { ok: true; state: MartialStancesState } | { ok: false; error: string }

export function applyMartialStanceAction(state: MartialStancesState, action: MartialStanceAction, level: unknown): MartialStanceActionResult {
  if (action.type === 'drop') return { ok: true, state: { ...state, active: null } }
  if (action.type === 'focus') {
    if (!Number.isInteger(action.value) || action.value < 0 || action.value > MAX_FOCUS) return { ok: false, error: '专注点必须是 0–6 的整数。' }
    return { ok: true, state: { ...state, focus: action.value } }
  }
  const stance = MARTIAL_STANCES.find(stance => stance.id === action.id)
  if (!stance) return { ok: false, error: '未知的武术架势。' }
  if (action.type === 'learn' && state.known.includes(action.id)) {
    return { ok: true, state: { ...state, known: state.known.filter(id => id !== action.id), active: state.active === action.id ? null : state.active } }
  }
  if (action.type === 'activate' && state.active === action.id) return { ok: true, state }
  const characterLevel = parseCharacterLevel(level)
  const tier = getCharacterTier(level)
  if (characterLevel === undefined || tier === undefined) return { ok: false, error: '请先填写 1–10 的角色等级。' }
  if (stance.tier > Number(tier)) return { ok: false, error: '只能掌握或激活当前位阶及以下的架势。' }
  if (action.type === 'learn') {
    if (state.known.length >= characterLevel + 1) return { ok: false, error: '首次掌握两种架势，之后每升一级可再掌握一种。' }
    if (stance.tier > 1 && MARTIAL_STANCES.filter(s => s.tier === 1 && state.known.includes(s.id)).length < 2) {
      return { ok: false, error: '请先从位阶 1 掌握最初的两种架势。' }
    }
    return { ok: true, state: { ...state, known: [...state.known, action.id] } }
  }
  if (!state.known.includes(action.id)) return { ok: false, error: '请先掌握这个架势。' }
  if (state.focus < 1) return { ok: false, error: '转入架势需要花费 1 专注点。' }
  return { ok: true, state: { ...state, active: action.id, focus: state.focus - 1 } }
}

/** Marking the last HP slot ends the stance; recovering HP never reactivates it. */
export function applyMartialStanceHealthInvariant(sheet: SheetData): SheetData {
  const max = Number(sheet.hpMax)
  if (!sheet.martialStances?.active || !Number.isInteger(max) || max < 1
    || !sheet.hp || sheet.hp.length < max || !sheet.hp.slice(0, max).every(Boolean)) return sheet
  return { ...sheet, martialStances: { ...sheet.martialStances, active: null } }
}
