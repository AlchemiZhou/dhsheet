"use client";

import React, { useState, useCallback } from "react";
import { ReferenceSheet, type PrintOverflow } from "./reference-sheet";
import { useProfessionSetupPreferences } from "@/character/profession-setup/preferences";
import {
  getProfessionPreset,
  resolveProfessionPresetId,
} from "@/character/profession-setup/catalog";
import { processCardDescription } from "@/card/card-types";
import type { SheetData } from "@/lib/sheet-data";
import { getVisiblePages } from "@/lib/page-registry";
import { useSheetAppearanceAttributes } from "@/components/sheet-appearance-provider";
import { SHEET_APPEARANCE_STYLES } from "@/character/appearance/styles";

interface PrintPageRendererProps {
  sheetData: SheetData;
  excludePageIds?: readonly string[];
}

/**
 * 动态渲染打印页面
 * 根据页面注册信息和当前数据状态自动渲染所有可见页面
 */
export function PrintPageRenderer({
  sheetData,
  excludePageIds = [],
}: PrintPageRendererProps) {
  const appearanceAttributes = useSheetAppearanceAttributes();
  const [overflow, setOverflow] = useState<Record<string, PrintOverflow>>({});
  const reportOverflow = useCallback(
    (entry: PrintOverflow | undefined, key: string) => {
      setOverflow((previous) => {
        if (
          (!entry && !previous[key]) ||
          (entry && previous[key]?.text === entry.text)
        )
          return previous;
        const next = { ...previous };
        if (entry) next[key] = entry;
        else delete next[key];
        return next;
      });
    },
    [],
  );
  const referenceEnabled = useProfessionSetupPreferences(
    (state) => state.referencePrint,
  );
  const profession = sheetData.cards?.[0];
  const preset = getProfessionPreset(profession);
  // Modified/custom profession rules continue to use their complete live sheet.
  const templateId =
    referenceEnabled &&
    preset &&
    profession?.description === processCardDescription(preset.description)
      ? resolveProfessionPresetId(profession)
      : undefined;
  const legacyNotes = [
    sheetData.characterBackground,
    sheetData.characterAppearance,
    sheetData.characterMotivation,
  ];
  const hasSupplement =
    templateId &&
    (Object.keys(overflow).length > 0 ||
      legacyNotes.some(Boolean) ||
      Boolean(sheetData.characterImage));
  const visiblePages = getVisiblePages(sheetData).filter(
    (page) => !excludePageIds.includes(page.id),
  );
  const lastPageIndex = visiblePages.length - 1;

  return (
    <div
      {...appearanceAttributes}
      className={`pb-40 print:pb-0 ${appearanceAttributes.className}`}
    >
      {visiblePages.map((page, index) => {
        const Component = page.printComponent ?? page.component;
        const isLastPage = index === lastPageIndex && !hasSupplement;
        const referencePage =
          templateId && (page.id === "page1" || page.id === "page2");

        return (
          <React.Fragment key={page.id}>
            <div
              className={`${page.printClass} ${referencePage ? "reference-print-page" : ""} flex justify-center items-start ${
                isLastPage ? "last-printed-page" : ""
              }`}
            >
              {index === 0 && <style>{SHEET_APPEARANCE_STYLES}</style>}
              {referencePage ? (
                <ReferenceSheet
                  sheet={sheetData}
                  id={templateId!}
                  page={page.id === "page1" ? 1 : 2}
                  onOverflow={reportOverflow}
                />
              ) : (
                <Component />
              )}
            </div>
          </React.Fragment>
        );
      })}
      {hasSupplement && (
        <section className="reference-continuation last-printed-page">
          <h2>角色补充记录</h2>
          {sheetData.characterImage && (
            <img src={sheetData.characterImage} alt="角色肖像" />
          )}
          {legacyNotes.map(
            (text, i) =>
              text && (
                <article key={i}>
                  <strong>{["角色简介", "角色特质", "冒险笔记"][i]}</strong>
                  <p>{text}</p>
                </article>
              ),
          )}
          {Object.values(overflow).map((entry) => (
            <article key={entry.key}>
              <strong>{entry.label}</strong>
              <p>{entry.text}</p>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
