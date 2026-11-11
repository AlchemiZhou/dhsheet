"use client"
import { useProfessionSetupPreferences } from "@/character/profession-setup/preferences"
import { useSheetAppearanceStore } from '@/lib/sheet-appearance-store'
import { PROFESSION_THEMES, type ProfessionThemeId } from '@/character/appearance/theme'

export function SheetAppearanceSettings({ printOnly = false }: { printOnly?: boolean }) {
  const { preferences, update } = useSheetAppearanceStore()
  const setup = useProfessionSetupPreferences()
  return <div className="space-y-3 p-3 text-sm">
    {!printOnly && <>
      <label className="flex items-start gap-2"><input type="checkbox" aria-label="选职业时自动匹配属性与装备" checked={setup.enabled} onChange={event => setup.setEnabled(event.target.checked)} /><span>选职业时自动匹配属性与装备<span className="block text-xs text-gray-500">替换当前属性、主副武器及护甲，可撤回。</span></span></label>
      <label className="block">车卡器配色
        <select aria-label="车卡器配色" className="mt-1 w-full rounded border bg-white p-2 text-gray-800" value={preferences.mode} onChange={event => update({ mode: event.target.value as typeof preferences.mode })}>
          <option value="auto">跟随所选职业</option><option value="neutral">保持默认配色</option><option value="profession">指定某职业配色</option>
        </select>
      </label>
      {preferences.mode === 'profession' && <label className="block">指定职业
        <select aria-label="指定职业配色" className="mt-1 w-full rounded border bg-white p-2 text-gray-800" value={preferences.profession} onChange={event => update({ profession: event.target.value as ProfessionThemeId })}>
          {Object.entries(PROFESSION_THEMES).map(([id, value]) => <option key={id} value={id}>{value.name}</option>)}
        </select>
      </label>}
    </>}
    <label className="block">导出前两页样式<select aria-label="导出前两页样式" value={setup.referencePrint ? 'reference' : 'current'} onChange={event => setup.setReferencePrint(event.target.value === 'reference')} className="mt-1 w-full rounded border bg-white p-2 text-gray-800"><option value="reference">原版彩色模板</option><option value="current">现有车卡器版式</option></select></label>
    <label className="block">打印配色
      <select aria-label="打印配色" className="mt-1 w-full rounded border bg-white p-2 text-gray-800" value={preferences.printMode} onChange={event => update({ printMode: event.target.value as 'color' | 'mono' })}>
        <option value="color">彩色打印</option><option value="mono">黑白打印</option>
      </select>
    </label>
  </div>
}
