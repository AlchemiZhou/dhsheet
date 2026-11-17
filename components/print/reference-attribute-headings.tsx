"use client";
import { useId, type CSSProperties } from "react";
import type { SheetData } from "@/lib/sheet-data";
import type { ReferenceFieldBox } from "@/character/print-reference/model";
import type { ProfessionThemeId } from "@/character/appearance/theme";
import { DOMAIN_COLORS, PROFESSION_THEMES } from "@/character/appearance/theme";
import {
  REFERENCE_PAGE_WIDTH as W,
  REFERENCE_PAGE_HEIGHT as H,
} from "@/character/print-reference/layout";
import { Tick } from "./reference-tick";
import { getBasePath } from "@/lib/utils";
import metadata from "@/data/character/paper-attribute-headings.json";
import { referenceRectPosition as paperPosition } from "@/character/print-reference/layout";

function transfer(source: number, target: number) {
  const slope = (255 - target) / (255 - source);
  return { slope, intercept: (target - slope * source) / 255 };
}
export function ReferenceAttributeHeadings({
  sheet,
  id,
  fields,
}: {
  sheet: SheetData;
  id: ProfessionThemeId;
  fields: Record<string, ReferenceFieldBox>;
}) {
  const uid = useId().replace(/:/g, "");
  const marked = Object.keys(metadata.headings).filter(
    (key) => sheet[key as keyof typeof metadata.headings]?.spellcasting,
  );
  const original = (
    metadata as typeof metadata & { defaults?: Record<string, string> }
  ).defaults?.[id];
  if (
    (marked.length === 0 && (!sheet.cards?.[1]?.id || !original)) ||
    (marked.length === 1 && marked[0] === original)
  )
    return null;
  const native = metadata.accents[id as keyof typeof metadata.accents];
  const fallback = DOMAIN_COLORS[PROFESSION_THEMES[id].domains[0]]
    .slice(1)
    .match(/../g)!
    .map((value) => parseInt(value, 16));
  const target: readonly number[] = native ?? fallback;
  const filters = Object.entries(metadata.headings)
    .map(([key, heading]) => [key, heading.background] as const)
    .concat([["caption", metadata.caption.background]]);
  return (
    <div className="paper-attribute-headings" aria-hidden="true">
      <div
        className="paper-heading-caption-mask"
        style={paperPosition([189, 57.5, 581, 66.2])}
      />
      <svg className="paper-color-filters">
        <defs>
          {filters.map(([name, color]) => (
            <filter
              key={name}
              id={`${uid}-${name}`}
              colorInterpolationFilters="sRGB"
            >
              <feComponentTransfer>
                {(["R", "G", "B"] as const).map((channel, i) => {
                  const props = transfer(color[i], target[i]);
                  return channel === "R" ? (
                    <feFuncR key={channel} type="linear" {...props} />
                  ) : channel === "G" ? (
                    <feFuncG key={channel} type="linear" {...props} />
                  ) : (
                    <feFuncB key={channel} type="linear" {...props} />
                  );
                })}
              </feComponentTransfer>
            </filter>
          ))}
        </defs>
      </svg>
      {Object.entries(metadata.headings).map(([key, heading]) => {
        const attribute = key as keyof typeof metadata.headings;
        const active = Boolean(sheet[attribute]?.spellcasting);
        const caption = metadata.caption.rect;
        const x = fields[`total.${key}`].rect[0] + metadata.caption.offset;
        return (
          <div key={key} data-paper-attribute={key} data-spellcasting={active}>
            <img
              alt=""
              className="paper-heading-image"
              src={`${getBasePath()}/print-templates/attribute-headings/${key}.webp`}
              style={
                {
                  ...paperPosition(heading.rect),
                  filter: active ? `url(#${uid}-${key})` : undefined,
                  "--paper-heading-filter": active
                    ? `url(#${uid}-${key})`
                    : "none",
                } as CSSProperties
              }
            />
            {active && (
              <img
                alt=""
                className="paper-heading-image"
                src={`${getBasePath()}/print-templates/attribute-headings/caption.webp`}
                style={
                  {
                    ...paperPosition([
                      x,
                      caption[1],
                      x + caption[2] - caption[0],
                      caption[3],
                    ]),
                    filter: `url(#${uid}-caption)`,
                    "--paper-heading-filter": `url(#${uid}-caption)`,
                  } as CSSProperties
                }
              />
            )}
          </div>
        );
      })}
      <svg className="paper-heading-ticks" viewBox={`0 0 ${W} ${H}`}>
        {Object.keys(metadata.headings).map((key) => (
          <Tick
            key={key}
            rect={fields[`mark.${key}`].rect}
            checked={Boolean(
              sheet[key as keyof typeof metadata.headings]?.checked,
            )}
          />
        ))}
      </svg>
    </div>
  );
}
