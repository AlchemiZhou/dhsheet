"use client";
import type { CSSProperties } from "react";
import type { SheetData } from "@/lib/sheet-data";
import { getBasePath } from "@/lib/utils";
import { Field, Tick, type PrintOverflow } from "./reference-sheet";
import {
  COMPANION_PORTRAIT,
  COMPANION_TRAINING_ROWS,
  companionPrintValues,
} from "@/character/print-reference/companion";
import type { ReferenceFieldBox } from "@/character/print-reference/model";
import "./reference-companion.css";

export function ReferenceCompanionSheet({
  sheet,
  onOverflow,
}: {
  sheet: SheetData;
  onOverflow: (entry: PrintOverflow | undefined, key: string) => void;
}) {
  const values = companionPrintValues(sheet),
    w = 595.2756,
    h = 841.8898,
    font = `${getBasePath()}/print-templates/form-ink.woff2`;
  const field = (
    name: string,
    value: string,
    rect: number[],
    fontSize = 10,
  ) => {
    const box: ReferenceFieldBox = { rect, fontSize, checkbox: false };
    return (
      <Field
        key={name}
        name={`companion:${name}`}
        value={value}
        box={box}
        onOverflow={(entry, key) =>
          onOverflow(
            entry
              ? {
                  ...entry,
                  label:
                    name === "description"
                      ? "伙伴描述"
                      : name.startsWith("experience")
                        ? "伙伴经历"
                        : "伙伴资料",
                }
              : undefined,
            key,
          )
        }
      />
    );
  };
  const portrait = COMPANION_PORTRAIT;
  return (
    <section
      className="a4-page reference-sheet reference-companion"
      aria-label="游侠动物伙伴打印页"
      style={{ "--reference-ink": "#2d4931" } as CSSProperties}
    >
      <style
        data-reference-font={font}
      >{`@font-face{font-family:'Reference Ink';src:url('${font}') format('woff2');font-display:block}`}</style>
      <div className="reference-canvas">
        <img
          className="reference-background"
          src={`${getBasePath()}/print-templates/ranger-companion.webp`}
          alt="游侠动物伙伴原版版式"
        />
        {sheet.companionImage && (
          <img
            className="reference-companion-portrait"
            src={sheet.companionImage}
            alt="伙伴头像"
            style={{
              left: `${(portrait.left / w) * 100}%`,
              top: `${(portrait.top / h) * 100}%`,
              width: `${portrait.size * 25.4 / 72}mm`,
              height: `${portrait.size * 25.4 / 72}mm`,
            }}
          />
        )}
        <div className="reference-companion-description-label">伙伴描述</div>
        {field("name", values.name, [65, 73, 405, 98], 15)}
        {field("evasion", values.evasion, [438, 32, 478, 68], 19)}
        {field("description", values.description, [166, 140, 538, 214], 10)}
        {values.experiences.flatMap((e, i) => [
          field(
            `experience${i}`,
            e.name,
            [54, 332 + i * 23.1, 308, 347 + i * 23.1],
            11,
          ),
          field(
            `experienceBonus${i}`,
            e.bonus,
            [308, 332 + i * 23.1, 335, 347 + i * 23.1],
            11,
          ),
        ])}
        {field("attack", values.attack, [48, 526, 138, 548], 10)}
        {field("attackRange", values.attackRange, [142, 526, 240, 548], 10)}
        <svg
          className="reference-marks"
          viewBox={`0 0 ${w} ${h}`}
          aria-hidden="true"
        >
          <rect x="92" y="678" width="148" height="20" fill="white" />
          {values.stress.map((checked, i) => (
            <g key={i}>
              <rect
                x={94 + i * 23.3}
                y="683"
                width="20"
                height="10"
                rx="1"
                fill="white"
                stroke={i < values.stressMax ? "#506247" : "#bbb"}
                strokeWidth=".8"
                strokeDasharray={i < values.stressMax ? undefined : "2 2"}
              />
              <Tick
                rect={[94 + i * 23.3, 683, 114 + i * 23.3, 693]}
                checked={checked}
              />
            </g>
          ))}
          {["D6", "D8", "D10", "D12"].map((dice, i) => (
            <circle
              key={dice}
              cx={[58.81, 102.3, 144.65, 188.14][i]}
              cy="571.34"
              r="2.1"
              fill={
                sheet.companionRange?.toUpperCase() === dice
                  ? "currentColor"
                  : "none"
              }
            />
          ))}
          {COMPANION_TRAINING_ROWS.flatMap(([key, y, count]) =>
            Array.from({ length: count }, (_, i) => (
              <Tick
                key={`${key}${i}`}
                rect={[
                  count === 1 ? 296.96 : 270.5 + i * 13.23,
                  y,
                  (count === 1 ? 296.96 : 270.5 + i * 13.23) + 9.53,
                  y + 9.53,
                ]}
                checked={Boolean(sheet.trainingOptions?.[key]?.[i])}
              />
            )),
          )}
        </svg>
      </div>
    </section>
  );
}
