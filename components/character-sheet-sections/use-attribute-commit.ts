"use client";
import { useCallback } from "react";
import { useSheetStore } from "@/lib/sheet-store";
import type { AttributeTargetId } from "@/automation/core/types";
import {
  getAttributeAutoBaseId,
  shouldRemoveAttributeAutoBase,
} from "@/automation/core/attribute-auto-base";

export type EditableAttribute =
  | "agility"
  | "strength"
  | "finesse"
  | "instinct"
  | "presence"
  | "knowledge";
/** Both editing surfaces submit attributes through the original auto-base workflow. */
export function useAttributeCommit() {
  return useCallback((attribute: EditableAttribute, submittedValue: string) => {
    const state = useSheetStore.getState();
    const sheet = state.sheetData;
    const target = `${attribute}.value` as AttributeTargetId;
    const existingUserBases = (sheet.userModifierContributions ?? []).filter(
      (entry) =>
        entry.definition.target === target && entry.definition.kind === "base",
    );
    if (
      shouldRemoveAttributeAutoBase({
        target,
        level: sheet.level,
        submittedValue,
        existingUserBases,
      })
    ) {
      const id = getAttributeAutoBaseId(target);
      state.removeUserModifierContribution(id);
      if (sheet.modifierState?.targetStates?.[target]?.activeBaseId === id)
        state.setActiveModifierBase(target, undefined);
    }
    state.commitModifierTargetValue(target, submittedValue);
  }, []);
}
