"use client";

import { useCallback, useEffect, useState } from "react";
import { projectCardAutomationSetupRequirements } from "@/card/automation/setup-projection";
import type { SheetData } from "@/lib/sheet-data";
import {
  CardAutomationSetupDialog,
  type CardAutomationSetupDialogProps,
} from "./card-automation-setup-dialog";

interface CardAutomationSetupAvailableEffect {
  kind: "cardAutomationSetupAvailable";
  cardInstanceId: string;
}

type CardAutomationSetupPromptEffect =
  | CardAutomationSetupAvailableEffect
  | { kind: string; cardInstanceId?: string };

export type CardAutomationSetupPromptSelectionResult =
  | {
      kind: "success";
      cardInstanceId?: string;
      effects?: CardAutomationSetupPromptEffect[];
    }
  | { kind: "failure"; message: string };

export interface UseCardAutomationSetupPromptInput {
  sheetData: SheetData;
  onSaveAbility: CardAutomationSetupDialogProps["onSaveAbility"];
}

function isCardAutomationSetupAvailableEffect(
  effect: CardAutomationSetupPromptEffect,
): effect is CardAutomationSetupAvailableEffect {
  return (
    effect.kind === "cardAutomationSetupAvailable" &&
    typeof effect.cardInstanceId === "string"
  );
}

function sheetContainsCardInstance(
  sheetData: SheetData,
  cardInstanceId: string,
) {
  return [
    ...(sheetData.cards ?? []),
    ...(sheetData.inventory_cards ?? []),
  ].some((card) => card?.instanceId === cardInstanceId);
}

export function useCardAutomationSetupPrompt({
  sheetData,
  onSaveAbility,
}: UseCardAutomationSetupPromptInput) {
  const [cardInstanceId, setCardInstanceId] = useState<string | null>(null);
  const [queuedCardInstanceIds, setQueuedCardInstanceIds] = useState<string[]>([]);
  const [pendingCardInstanceId, setPendingCardInstanceId] = useState<{
    cardInstanceId: string;
    observedSheetData: SheetData;
  } | null>(null);

  const openForCard = useCallback(
    (nextCardInstanceId: string) => {
      const requirements = projectCardAutomationSetupRequirements(sheetData, {
        cardInstanceId: nextCardInstanceId,
      });

      if (requirements.length > 0) {
        setCardInstanceId(nextCardInstanceId);
      }
    },
    [sheetData],
  );

  useEffect(() => {
    if (!pendingCardInstanceId) return;
    if (pendingCardInstanceId.observedSheetData === sheetData) return;
    if (
      !sheetContainsCardInstance(
        sheetData,
        pendingCardInstanceId.cardInstanceId,
      )
    ) {
      return;
    }

    const requirements = projectCardAutomationSetupRequirements(sheetData, {
      cardInstanceId: pendingCardInstanceId.cardInstanceId,
    });

    if (requirements.length > 0) {
      setCardInstanceId(pendingCardInstanceId.cardInstanceId);
    }
    setPendingCardInstanceId(null);
  }, [pendingCardInstanceId, sheetData]);

  const handleSelectionResult = useCallback(
    (result: CardAutomationSetupPromptSelectionResult) => {
      if (result.kind === "failure") return;

      const setupEffects = result.effects?.filter(isCardAutomationSetupAvailableEffect) ?? [];

      if (setupEffects.length > 0) {
        const ids = Array.from(new Set(setupEffects.map(effect => effect.cardInstanceId)));
        setCardInstanceId(ids[0]);
        setQueuedCardInstanceIds(ids.slice(1));
        setPendingCardInstanceId(null);
        return;
      }

      if (result.cardInstanceId) {
        setPendingCardInstanceId({
          cardInstanceId: result.cardInstanceId,
          observedSheetData: sheetData,
        });
      }
    },
    [sheetData],
  );

  const dialog = (
    <CardAutomationSetupDialog
      open={Boolean(cardInstanceId)}
      sheetData={sheetData}
      cardInstanceId={cardInstanceId}
      onOpenChange={(open) => {
        if (!open) {
          setCardInstanceId(queuedCardInstanceIds[0] ?? null);
          setQueuedCardInstanceIds(queuedCardInstanceIds.slice(1));
        }
      }}
      onSaveAbility={onSaveAbility}
    />
  );

  return {
    openForCard,
    handleSelectionResult,
    dialog,
  };
}
