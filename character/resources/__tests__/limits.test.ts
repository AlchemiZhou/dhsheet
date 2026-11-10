import { describe, expect, it } from "vitest"
import { defaultSheetData } from "@/lib/default-sheet-data"
import { normalizeCurrentSheetData } from "@/lib/sheet-data-migration"
import { getReferenceSummary } from "@/automation/core/registry"
import { applyAutoCalculationForTargets } from "@/automation/core/target-sync"
import { reconcileFinalInput, disableAutoCalculationForTarget, enableAutoCalculationForTarget } from "@/automation/core/final-input-reconciliation"
import { createManualBaseContribution } from "@/automation/core/special-contributions"
import { writeTargetValue } from "@/automation/core/target-accessors"
import { CHARACTER_RESOURCE_LIMIT, limitCharacterResourceMax } from "../limits"

for (const target of ["hpMax", "stressMax"] as const) {
  const field = target === "hpMax" ? "hp" : "stress"
  describe(`${target} slot limit`, () => {
    const base = createManualBaseContribution(target, 10)
    const bonus = { id: `test:${target}:bonus`, definition: { target, kind: "modifier" as const }, editable: { label: "Bonus", value: 5 } }
    const source = () => ({ ...defaultSheetData, userModifierContributions: [base, bonus] })

    it("caps automatic totals without changing their sources and recovers after removing a bonus", () => {
      const capped = applyAutoCalculationForTargets(source())
      expect(capped[target]).toBe(12)
      expect(getReferenceSummary(capped, target)).toMatchObject({ referenceTotal: 15, calculatedFinalTotal: 12, unattributedDelta: 0 })
      expect(capped.userModifierContributions).toEqual([base, bonus])
      const blurred = applyAutoCalculationForTargets(reconcileFinalInput(capped, target, 12))
      expect(blurred.otherAdjustments).toEqual([])
      expect(applyAutoCalculationForTargets({ ...blurred, userModifierContributions: [base] })[target]).toBe(10)
      expect(applyAutoCalculationForTargets(capped)).toBe(capped)
    })

    it("caps direct and manual final writes", () => {
      expect(writeTargetValue(defaultSheetData, target, 18)[target]).toBe(12)
      const edited = applyAutoCalculationForTargets(reconcileFinalInput(defaultSheetData, target, 20))
      expect(edited[target]).toBe(12)
      expect(getReferenceSummary(edited, target).calculatedFinalTotal).toBe(12)
      if (target === "hpMax") {
        expect(edited.userModifierContributions).toContainEqual(createManualBaseContribution(target, 12))
      } else {
        // Stress already has its level-provided base of six.
        expect(edited.otherAdjustments).toContainEqual(expect.objectContaining({ target, value: 6 }))
      }
    })

    it("still honors an intentional decrease below the cap", () => {
      const capped = applyAutoCalculationForTargets(source())
      const decreased = applyAutoCalculationForTargets(reconcileFinalInput(capped, target, 11))
      expect(decreased[target]).toBe(11)
      expect(decreased.otherAdjustments).toContainEqual(expect.objectContaining({ target, kind: "manualFinalAdjustment", value: -4 }))
    })

    it("does not manufacture a negative difference when automatic calculation is re-enabled at the cap", () => {
      const capped = applyAutoCalculationForTargets(source())
      const locked = disableAutoCalculationForTarget(capped, target)
      const resumed = applyAutoCalculationForTargets(enableAutoCalculationForTarget(locked, target))
      expect(resumed[target]).toBe(12)
      expect(resumed.otherAdjustments).toEqual([])
      expect(applyAutoCalculationForTargets({ ...resumed, userModifierContributions: [base] })[target]).toBe(10)
    })

    it("normalizes older saves and clears only marks beyond the allowed maximum, including locked targets", () => {
      const legacy = { ...defaultSheetData, [target]: 18, [field]: Array(18).fill(true), modifierState: { targetStates: { [target]: { autoCalculation: false } }, entryStates: {} } }
      for (const normalized of [normalizeCurrentSheetData(legacy), applyAutoCalculationForTargets(legacy)]) {
        expect(normalized[target]).toBe(12)
        expect(normalized[field]?.filter(Boolean)).toHaveLength(12)
        expect(normalized[field]?.slice(0, 12)).toEqual(Array(12).fill(true))
      }
    })
  })
}

it("uses twelve player slots without changing companion slots or unrelated targets", () => {
  expect(defaultSheetData.hp).toHaveLength(CHARACTER_RESOURCE_LIMIT)
  expect(defaultSheetData.stress).toHaveLength(CHARACTER_RESOURCE_LIMIT)
  expect(defaultSheetData.companionStress).toHaveLength(18)
  expect(limitCharacterResourceMax("evasion", 20)).toBe(20)
})
