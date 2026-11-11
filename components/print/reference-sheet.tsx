"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { SheetData } from "@/lib/sheet-data";
import { getBasePath } from "@/lib/utils";
import {
  PROFESSION_PRESETS,
  type ProfessionPreset,
} from "@/character/profession-setup/catalog";
import type { ProfessionThemeId } from "@/character/appearance/theme";
import {
  referenceValues,
  referenceCheckValue,
  referenceFieldLabel,
  type ReferenceFieldBox,
} from "@/character/print-reference/model";
import { createProfessionStory } from "@/character/profession-setup/story";
import {
  REFERENCE_PAGE_WIDTH,
  REFERENCE_PAGE_HEIGHT,
  splitReferenceFeature,
} from "@/character/print-reference/layout";
import "./reference-sheet.css";

export interface PrintOverflow {
  key: string;
  label: string;
  text: string;
}
const width = REFERENCE_PAGE_WIDTH,
  height = REFERENCE_PAGE_HEIGHT;
function Field({
  box,
  value,
  name,
  question = false,
  fit = true,
  onOverflow,
}: {
  box: ReferenceFieldBox;
  value: string;
  name: string;
  question?: boolean;
  fit?: boolean;
  onOverflow: (entry: PrintOverflow | undefined, key: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!fit) return;
    let cancelled = false;
    const fitText = () => {
      const element = ref.current;
      if (!element || cancelled) return;
      const initial = ((box.fontSize || 10) * 4) / 3;
      let size = initial;
      element.style.fontSize = `${size}px`;
      while (
        size > 7 &&
        (element.scrollHeight > element.clientHeight + 1 ||
          element.scrollWidth > element.clientWidth + 1)
      ) {
        size -= 0.4;
        element.style.fontSize = `${size}px`;
      }
      const overflow =
        element.scrollHeight > element.clientHeight + 1 ||
        element.scrollWidth > element.clientWidth + 1;
      onOverflow(
        overflow
          ? { key: name, label: referenceFieldLabel(name), text: value }
          : undefined,
        name,
      );
    };
    document.fonts.ready.then(fitText);
    return () => {
      cancelled = true;
    };
  }, [box, value, name, onOverflow, fit]);
  const [x, y, x2, y2] = box.rect;
  return (
    <div
      ref={ref}
      data-reference-field={name}
      className={`reference-field ${question ? "reference-question" : ""}`}
      style={
        {
          left: `${(x / width) * 100}%`,
          top: `${(y / height) * 100}%`,
          width: `${((x2 - x) / width) * 100}%`,
          height: `${((y2 - y) / height) * 100}%`,
          fontSize: ((box.fontSize || 10) * 4) / 3,
          textAlign: /^(total\.|level|exp\.\d+\.bonus)/.test(
            name.replace(/^[12]:/, ""),
          )
            ? "center"
            : "left",
        } as CSSProperties
      }
    >
      {value}
    </div>
  );
}

function FeatureFields({
  boxes,
  value,
  name,
  onOverflow,
}: {
  boxes: ReferenceFieldBox[];
  value: string;
  name: string;
  onOverflow: (entry: PrintOverflow | undefined, key: string) => void;
}) {
  const [layout, setLayout] = useState({
    lines: [value, ""],
    fontSize: boxes[0].fontSize,
  });
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (cancelled) return;
      const context = document.createElement("canvas").getContext("2d");
      if (!context) throw new Error("无法测量装备特性的打印文字");
      let fontSize = boxes[0].fontSize;
      const wrap = () => {
        context.font = `${(fontSize * 4) / 3}px "Reference Ink"`;
        return splitReferenceFeature(
          value,
          boxes.map((box) => ((box.rect[2] - box.rect[0] - 4) * 4) / 3),
          (text) => context.measureText(text).width,
        );
      };
      let result = wrap();
      while (result.remaining && fontSize > 5.25) {
        fontSize = Math.max(5.25, fontSize - 0.3);
        result = wrap();
      }
      setLayout({ lines: result.lines, fontSize });
      onOverflow(
        result.remaining
          ? { key: name, label: referenceFieldLabel(name), text: value }
          : undefined,
        name,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [boxes[0], boxes[1], value, name, onOverflow]);
  return (
    <>
      {boxes.map((box, index) => (
        <Field
          key={index}
          box={{ ...box, fontSize: layout.fontSize }}
          value={layout.lines[index] ?? ""}
          name={index ? `${name}2` : name}
          fit={false}
          onOverflow={onOverflow}
        />
      ))}
    </>
  );
}
function Tick({ rect, checked }: { rect: number[]; checked: boolean }) {
  if (!checked) return null;
  const [x, y, x2, y2] = rect,
    w = x2 - x,
    h = y2 - y;
  return (
    <path
      className="reference-tick"
      d={`M${x + w * 0.16} ${y + h * 0.53}l${w * 0.24} ${h * 0.28} ${w * 0.47} ${-h * 0.64}`}
    />
  );
}
export function ReferenceSheet({
  sheet,
  id,
  page,
  onOverflow,
}: {
  sheet: SheetData;
  id: ProfessionThemeId;
  page: 1 | 2;
  onOverflow: (entry: PrintOverflow | undefined, key: string) => void;
}) {
  const preset = PROFESSION_PRESETS[id] as ProfessionPreset;
  const fields = preset.pages[page - 1].fields as unknown as Record<
    string,
    ReferenceFieldBox
  >;
  const values = referenceValues(sheet);
  const fontUrl = `${getBasePath()}/print-templates/form-ink.woff2`;
  const story =
    sheet.professionStory ?? createProfessionStory(sheet.cards?.[0]);
  const box = (rect: number[], fontSize = 10): ReferenceFieldBox => ({
    rect,
    fontSize,
    checkbox: false,
  });
  return (
    <section
      className="a4-page reference-sheet"
      aria-label={`${preset.name}原版模板第${page}页`}
      style={
        {
          "--reference-ink": preset.ink,
        } as CSSProperties
      }
    >
      <div className="reference-canvas">
        <style
          data-reference-font={fontUrl}
        >{`@font-face{font-family:'Reference Ink';src:url('${fontUrl}') format('woff2');font-display:block}`}</style>
        <img
          className="reference-background"
          src={`${getBasePath()}/print-templates/${id}-${page}.webp`}
          alt={`${preset.name}第${page}页原版版式`}
          loading="eager"
        />
        {Object.entries(fields)
          .filter(
            ([name, definition]) =>
              !definition.checkbox &&
              values[name] &&
              !name.endsWith("feature2"),
          )
          .map(([name, definition]) => {
            let adjusted = definition;
            if (name.endsWith(".feature")) {
              const second = fields[name + "2"];
              if (second)
                return (
                  <FeatureFields
                    key={name}
                    boxes={[definition, second]}
                    value={values[name]}
                    name={`${page}:${name}`}
                    onOverflow={onOverflow}
                  />
                );
            }
            if (page === 2 && /^(background|relationship)\./.test(name))
              adjusted = {
                ...definition,
                rect: [
                  definition.rect[0],
                  definition.rect[1] + 13,
                  definition.rect[2],
                  definition.rect[3] - 3,
                ],
                fontSize: 10,
              };
            return (
              <Field
                key={name}
                box={adjusted}
                value={values[name]}
                name={`${page}:${name}`}
                onOverflow={onOverflow}
              />
            );
          })}
        {page === 2 &&
          (["background", "connections"] as const).flatMap((group, column) =>
            story[group].map((entry, i) => (
              <Field
                key={`${group}${i}`}
                box={box(
                  [
                    column ? 323 : 32.8,
                    254 + i * 77,
                    (column ? 323 : 32.8) + 247,
                    276 + i * 77,
                  ],
                  7.5,
                )}
                value={entry.question}
                question
                name={`question:${group}:${i}`}
                onOverflow={onOverflow}
              />
            )),
          )}
        <svg
          className="reference-marks"
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
        >
          {Object.entries(fields)
            .filter(
              ([name, definition]) =>
                definition.checkbox &&
                /^(mark\.|track\.armor\.|guide\.)/.test(name),
            )
            .map(([name, definition]) => (
              <Tick
                key={name}
                rect={definition.rect}
                checked={referenceCheckValue(name, sheet)}
              />
            ))}
          {page === 1 && (
            <>
              {(["hp", "stress"] as const).flatMap((kind) =>
                Array.from({ length: 12 }, (_, i) => {
                  const f = fields[`slot.${kind}.${i + 1}`],
                    r = f.rect,
                    max =
                      Number(sheet[kind === "hp" ? "hpMax" : "stressMax"]) || 0;
                  return (
                    <g key={`${kind}${i}`}>
                      <rect
                        x={r[0]}
                        y={r[1]}
                        width={r[2] - r[0]}
                        height={r[3] - r[1]}
                        rx="1.5"
                        fill="white"
                        stroke={i < max ? "#555" : "#c4c4c4"}
                        strokeWidth=".8"
                        strokeDasharray={i < max ? undefined : "2 2"}
                      />
                      <Tick rect={r} checked={Boolean(sheet[kind]?.[i])} />
                    </g>
                  );
                }),
              )}
              <rect x="426.4" y="166.6" width="67" height="11" fill="white" />
              {Array.from({ length: 6 }, (_, i) => {
                const r = fields[`proficiency.${i + 1}`].rect;
                const filled = Array.isArray(sheet.proficiency)
                  ? sheet.proficiency[i]
                  : i < sheet.proficiency;
                return (
                  <circle
                    key={i}
                    cx={(r[0] + r[2]) / 2}
                    cy={(r[1] + r[3]) / 2}
                    r={(r[2] - r[0]) / 2}
                    stroke="#555"
                    strokeWidth=".8"
                    fill={filled ? "#444" : "white"}
                  />
                );
              })}
              {(sheet.hopeMax ?? 6) > 6 && (
                <path
                  d="M33.36 292.88H230.67L237.01 299.22V302.92L230.67 309.26H33.36L27.01 302.92V299.22Z"
                  fill="#e3dcd3"
                />
              )}
              {Array.from(
                { length: Math.max(6, Math.min(8, sheet.hopeMax ?? 6)) },
                (_, i) => {
                  const n = Math.max(6, Math.min(8, sheet.hopeMax ?? 6)),
                    cx = 45.8 + (i * 172.5) / (n - 1);
                  return (
                    <g key={`hope${i}`}>
                      {n > 6 && (
                        <path d={`M${cx - 8} 301l8-8 8 8-8 8z`} fill="white" />
                      )}
                      <Tick
                        rect={[cx - 5, 296.2, cx + 5, 306]}
                        checked={i < sheet.hope}
                      />
                    </g>
                  );
                },
              )}
              <rect x="14" y="566" width="215" height="14" fill="white" />
              {Array.from({ length: 20 }, (_, i) => {
                const x = i < 10 ? 15.2 + i * 10.8 : 130.3 + (i - 10) * 9.6;
                return (
                  <g key={`gold${i}`}>
                    {i < 10 ? (
                      <circle
                        cx={x + 3.8}
                        cy="574.7"
                        r="3.8"
                        fill="white"
                        stroke="#bbb"
                        strokeWidth=".65"
                      />
                    ) : (
                      <path
                        d={`M${x + 2} 568h4l-1 3q5 6 1 8h-5q-4-2 1-8z`}
                        fill="white"
                        stroke="#bbb"
                        strokeWidth=".65"
                      />
                    )}
                    <Tick
                      rect={[x, 570.5, x + 7.6, 578.5]}
                      checked={Boolean(sheet.gold[i])}
                    />
                  </g>
                );
              })}
              <Tick
                rect={fields["gold.chest"].rect}
                checked={Boolean(sheet.gold[20])}
              />
            </>
          )}
        </svg>
      </div>
    </section>
  );
}
