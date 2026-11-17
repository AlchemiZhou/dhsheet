"use client";
import { compactIdentityField } from "@/character/print-reference/identity-controls";
import { PaperIdentitySwitches } from "./paper-identity-switches";
import { isExtraReferenceField } from "@/character/print-reference/extra-values";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  useAttributeCommit,
  type EditableAttribute,
} from "@/components/character-sheet-sections/use-attribute-commit";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { parseNumberExpressionOr } from "@/lib/number-utils";
import { ReferenceSheet } from "@/components/print/reference-sheet";
import { useSheetStore } from "@/lib/sheet-store";
import {
  getProfessionPreset,
  resolveProfessionPresetId,
} from "@/character/profession-setup/catalog";
import {
  referenceValues,
  type ReferenceFieldBox,
} from "@/character/print-reference/model";
import {
  editablePaperField,
  paperFieldBox,
  paperFieldTarget,
  paperFieldLabel,
} from "@/character/print-reference/editor-fields";
import {
  REFERENCE_PAGE_WIDTH as W,
  REFERENCE_PAGE_HEIGHT as H,
  REFERENCE_CHARACTER_PORTRAIT,
} from "@/character/print-reference/layout";
import {
  createProfessionStory,
  storyWritingModes,
} from "@/character/profession-setup/story";
import { processCardDescription } from "@/card/card-types";
import { markResourceTrack } from "@/character/resources/mark-track";
import { PaperValue, paperPosition } from "./paper-value";
import "./paper-editor.css";

export type PaperDetail =
  | "identity"
  | "resources"
  | "attributes"
  | "hope"
  | "main"
  | "off"
  | "armor"
  | "reserve1"
  | "reserve2"
  | "story"
  | "portrait"
  | "upgrades";
export interface PaperSheetEditorProps {
  page: 1 | 2;
  children: ReactNode;
  after?: ReactNode;
  onDetails: (section: PaperDetail) => void;
  onChoice?: (
    kind: "profession" | "ancestry" | "community" | "subclass",
  ) => void;
  onMixedChange?: (enabled: boolean) => void;
  onTransformationChange?: (enabled: boolean) => void;
  onConfigureTransformation?: () => void;
  onEquipment?: (
    slot: "main" | "off" | "armor" | "reserve1" | "reserve2",
  ) => void;
}
const attrKeys = [
  "agility",
  "strength",
  "finesse",
  "instinct",
  "presence",
  "knowledge",
] as const;

export function PaperSheetEditor({
  page,
  children,
  after,
  onDetails,
  onChoice,
  onEquipment,
  onMixedChange,
  onTransformationChange,
  onConfigureTransformation,
}: PaperSheetEditorProps) {
  const store = useSheetStore();
  const commitAttribute = useAttributeCommit();
  const sheet = store.sheetData;
  const id = resolveProfessionPresetId(sheet.cards?.[0]);
  const preset = getProfessionPreset(sheet.cards?.[0]);
  // The original thirteen cards have a source PDF. Custom rule text keeps its complete editor.
  const available =
    id &&
    preset &&
    processCardDescription(preset.description) ===
      sheet.cards?.[0]?.description;
  const [overflow, setOverflow] = useState<
    Record<string, { key: string; label: string; text: string }>
  >({});
  const [showOverflow, setShowOverflow] = useState(false);
  const onOverflow = useCallback(
    (
      entry: { key: string; label: string; text: string } | undefined,
      key: string,
    ) => {
      setOverflow((previous) => {
        if (entry?.text === previous[key]?.text) return previous;
        if (!entry && !previous[key]) return previous;
        const next = { ...previous };
        if (entry) next[key] = entry;
        else delete next[key];
        return next;
      });
    },
    [],
  );
  const viewport = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(794);
  const [zoom, setZoom] = useState(0);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const resize = () => setAvailableWidth(element.clientWidth || 794);
    resize();
    const observer =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(resize)
        : undefined;
    observer?.observe(element);
    window.addEventListener("resize", resize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [available]);
  const commit = useCallback(
    (name: string, value: string) => {
      const state = useSheetStore.getState();
      if (isExtraReferenceField(name)) {
        state.setSheetData((previous) => ({
          referenceFieldValues: {
            ...previous.referenceFieldValues,
            [name]: value,
          },
        }));
        return;
      }
      const attribute = name.match(
        /^total\.(agility|strength|finesse|instinct|presence|knowledge)$/,
      );
      if (attribute) {
        commitAttribute(attribute[1] as EditableAttribute, value);
        return;
      }
      const target = paperFieldTarget(name);
      if (target) {
        state.commitModifierTargetValue(target, value);
        return;
      }
      if (name === "name") {
        state.updateName(value);
        return;
      }
      if (name === "level") {
        state.updateLevel(value);
        return;
      }
      let match = name.match(/^exp\.(\d)\.name$/);
      if (match) {
        state.updateExperience(Number(match[1]) - 1, value);
        return;
      }
      match = name.match(/^pack\.(\d)$/);
      if (match) {
        const index = Number(match[1]);
        state.setSheetData((previous) => {
          const inventory = [...previous.inventory];
          inventory[index] = value;
          return { inventory };
        });
        return;
      }
      match = name.match(/^(background|relationship)\.(\d)$/);
      const question = name.match(/^question:(background|connections):(\d)$/);
      if (match || question) {
        const group = question
          ? (question[1] as "background" | "connections")
          : match![1] === "background"
            ? "background"
            : "connections";
        const index = question ? Number(question[2]) : Number(match![2]) - 1;
        state.setSheetData((previous) => {
          const story =
            previous.professionStory ??
            createProfessionStory(previous.cards?.[0]);
          return {
            professionStory: {
              ...story,
              [group]: story[group].map((entry, i) =>
                i === index
                  ? { ...entry, [question ? "question" : "answer"]: value }
                  : entry,
              ),
            },
          };
        });
        return;
      }
      if (name === "story.background" || name === "story.profile")
        state.setSheetData({
          [name === "story.background"
            ? "characterBackground"
            : "characterAppearance"]: value,
        });
    },
    [commitAttribute],
  );
  if (!available || !preset || !id) return <>{children}</>;
  const fields = preset.pages[page - 1].fields as unknown as Record<
    string,
    ReferenceFieldBox
  >;
  const values = referenceValues(sheet);
  const modes = storyWritingModes(sheet);
  const story =
    sheet.professionStory ?? createProfessionStory(sheet.cards?.[0]);
  const scale = zoom || Math.min(1, availableWidth / ((W * 4) / 3));
  const hit = (
    key: string,
    rect: readonly number[],
    label: string,
    action: () => void,
    checked?: boolean,
    disabled = false,
  ) => (
    <button
      key={key}
      type="button"
      className="paper-hit"
      style={paperPosition(rect)}
      aria-label={label}
      title={label}
      role={checked === undefined ? undefined : "checkbox"}
      aria-checked={checked}
      disabled={disabled}
      onClick={action}
    />
  );
  const choice: Record<string, "ancestry" | "community" | "subclass"> = {
    ancestry: "ancestry",
    community: "community",
    subclass: "subclass",
  };
  return (
    <section className="paper-editor" data-paper-page={page}>
      <div className="paper-tools print:hidden">
        <label>
          缩放
          <select
            aria-label="角色卡缩放"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          >
            <option value={0}>适应宽度</option>
            <option value={1}>100%</option>
            <option value={1.25}>125%</option>
            <option value={1.5}>150%</option>
            <option value={2}>200%</option>
          </select>
        </label>
        {page === 1 ? (
          <>
            <button type="button" onClick={() => onDetails("identity")}>
              身份与转变
            </button>
            <button type="button" onClick={() => onDetails("resources")}>
              生命与压力
            </button>
            <button type="button" onClick={() => onDetails("attributes")}>
              属性设置
            </button>
            <button type="button" onClick={() => onDetails("hope")}>
              希望设置
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => onDetails("portrait")}>
              角色头像
            </button>
            <button type="button" onClick={() => onDetails("story")}>
              背景与关系
            </button>
            <button type="button" onClick={() => onDetails("upgrades")}>
              升级选项
            </button>
          </>
        )}
        {Object.keys(overflow).length > 0 && (
          <button type="button" onClick={() => setShowOverflow(true)}>
            补充内容（{Object.keys(overflow).length}）
          </button>
        )}
      </div>
      <div ref={viewport} className="paper-viewport">
        <div
          className="paper-size"
          style={{
            width: ((W * 4) / 3) * scale,
            height: ((H * 4) / 3) * scale,
          }}
        >
          <div
            className="paper-surface"
            style={{ transform: `scale(${scale})` }}
          >
            <ReferenceSheet
              sheet={sheet}
              id={id}
              page={page}
              onOverflow={onOverflow}
              showEmptyPortrait={page === 2}
              compactIdentity={page === 1}
              screenImageSize={`${((W * 4) / 3) * scale}px`}
            />

            <div className="paper-hit-layer">
              {page === 1 && (
                <PaperIdentitySwitches
                  sheet={sheet}
                  onMixedChange={onMixedChange}
                  onTransformationChange={onTransformationChange}
                  onConfigureMixed={() => onDetails("identity")}
                  onConfigureTransformation={onConfigureTransformation}
                />
              )}
              {page === 1 &&
                hit("profession", [0, 0, 198.323, 55.553], "选择职业", () =>
                  onChoice?.("profession"),
                )}
              {Object.entries(fields).flatMap(([name, field]) => {
                if (field.checkbox || name.endsWith("feature2")) return [];
                if (
                  page === 2 &&
                  ((name.startsWith("background.") &&
                    modes.background === "free") ||
                    (name.startsWith("relationship.") &&
                      modes.connections === "profile"))
                )
                  return [];
                if (choice[name])
                  return [
                    hit(
                      name,
                      (page === 1 ? compactIdentityField(name, field) : field)
                        .rect,
                      `选择${paperFieldLabel(name)}`,
                      () => onChoice?.(choice[name]),
                    ),
                  ];
                if (editablePaperField(name))
                  return [
                    <PaperValue
                      key={name}
                      live={!paperFieldTarget(name) && name !== "level"}
                      allowedDraft={
                        name === "level"
                          ? (value) =>
                              value === "" || /^(?:[1-9]|10)$/.test(value)
                          : undefined
                      }
                      label={paperFieldLabel(name)}
                      value={values[name] ?? ""}
                      box={paperFieldBox(name, field, page)}
                      onCommit={(value) => commit(name, value)}
                      multiline={/^(background|relationship)/.test(name)}
                    />,
                  ];
                const equipment = name.match(
                  /^(main|off|armor|reserve1|reserve2)\./,
                );
                if (equipment) {
                  const slot = equipment[1] as
                    | "main"
                    | "off"
                    | "armor"
                    | "reserve1"
                    | "reserve2";
                  return [
                    hit(name, field.rect, `编辑${paperFieldLabel(name)}`, () =>
                      name.endsWith(".name")
                        ? onEquipment?.(slot)
                        : onDetails(slot),
                    ),
                  ];
                }
                return [];
              })}
              {page === 1 && (
                <>
                  {Object.entries(fields)
                    .filter(
                      ([name, field]) =>
                        field.checkbox && /^(mark\.|track\.armor\.)/.test(name),
                    )
                    .map(([name, field]) => {
                      const attr = name.match(/^mark\.(\w+)$/);
                      const index = Number(name.split(".").pop()) - 1;
                      return attr
                        ? hit(
                            name,
                            field.rect,
                            `属性提升：${attr[1]}`,
                            () =>
                              store.toggleAttributeChecked(
                                attr[1] as (typeof attrKeys)[number],
                              ),
                            Boolean(
                              sheet[attr[1] as (typeof attrKeys)[number]]
                                ?.checked,
                            ),
                          )
                        : hit(
                            name,
                            field.rect,
                            `护甲第${index + 1}槽`,
                            () => store.updateArmorBox(index),
                            Boolean(sheet.armorBoxes?.[index]),
                            index >= Number(sheet.armorMax),
                          );
                    })}
                  {(["hp", "stress"] as const).flatMap((kind) =>
                    Array.from({ length: 12 }, (_, i) =>
                      hit(
                        `${kind}${i}`,
                        fields[`slot.${kind}.${i + 1}`].rect,
                        `${kind === "hp" ? "生命" : "压力"}第${i + 1}格`,
                        () =>
                          store.setSheetData((previous) =>
                            markResourceTrack(previous, kind, i),
                          ),
                        Boolean(sheet[kind]?.[i]),
                        i >=
                          Number(sheet[kind === "hp" ? "hpMax" : "stressMax"]),
                      ),
                    ),
                  )}
                  {Array.from({ length: 6 }, (_, i) =>
                    hit(
                      `prof${i}`,
                      fields[`proficiency.${i + 1}`].rect,
                      `熟练度第${i + 1}点`,
                      () => store.updateProficiency(i),
                      Array.isArray(sheet.proficiency)
                        ? sheet.proficiency[i]
                        : i < sheet.proficiency,
                    ),
                  )}
                  {Array.from(
                    { length: Math.max(6, Math.min(8, sheet.hopeMax ?? 6)) },
                    (_, i) => {
                      const count = Math.max(
                          6,
                          Math.min(8, sheet.hopeMax ?? 6),
                        ),
                        x = 45.8 + (i * 172.5) / (count - 1);
                      return hit(
                        `hope${i}`,
                        [x - 7, 294, x + 7, 308],
                        `希望第${i + 1}点`,
                        () => store.updateHope(i),
                        i < sheet.hope,
                        i >= (sheet.hopeMax ?? 6),
                      );
                    },
                  )}
                  {Array.from({ length: 21 }, (_, i) => {
                    const x = i < 10 ? 15.2 + i * 10.8 : 130.3 + (i - 10) * 9.6;
                    return hit(
                      `gold${i}`,
                      i === 20
                        ? fields["gold.chest"].rect
                        : [x, 568, x + 7.6, 580],
                      `金币第${i + 1}格`,
                      () => store.updateGold(i),
                      Boolean(sheet.gold[i]),
                    );
                  })}
                </>
              )}
              {page === 2 && (
                <>
                  {hit(
                    "portrait",
                    [
                      REFERENCE_CHARACTER_PORTRAIT.mask[0],
                      REFERENCE_CHARACTER_PORTRAIT.mask[1],
                      REFERENCE_CHARACTER_PORTRAIT.mask[2],
                      REFERENCE_CHARACTER_PORTRAIT.mask[3],
                    ],
                    "编辑角色头像",
                    () => onDetails("portrait"),
                  )}
                  {(["background", "connections"] as const).flatMap(
                    (group, column) =>
                      modes[group] === "questions"
                        ? story[group].map((entry, i) => (
                            <PaperValue
                              live
                              key={`${group}${i}`}
                              label={`${group === "background" ? "背景问题" : "关系"}${i + 1}描述`}
                              value={entry.question}
                              box={{
                                rect: [
                                  column ? 323 : 32.8,
                                  254 + i * 77,
                                  (column ? 323 : 32.8) + 247,
                                  276 + i * 77,
                                ],
                                fontSize: 7.5,
                                checkbox: false,
                              }}
                              onCommit={(value) =>
                                commit(`question:${group}:${i}`, value)
                              }
                              multiline
                            />
                          ))
                        : [
                            <PaperValue
                              live
                              key={group}
                              label={column ? "角色介绍" : "背景故事"}
                              value={
                                (column
                                  ? sheet.characterAppearance
                                  : sheet.characterBackground) ?? ""
                              }
                              box={{
                                rect: [
                                  column ? 323 : 32.8,
                                  254,
                                  (column ? 323 : 32.8) + 247,
                                  459,
                                ],
                                fontSize: 10,
                                checkbox: false,
                              }}
                              onCommit={(value) =>
                                commit(
                                  column ? "story.profile" : "story.background",
                                  value,
                                )
                              }
                              multiline
                            />,
                          ],
                  )}
                  {hit("upgrades", [22, 464, 580, 818], "编辑升级选项", () =>
                    onDetails("upgrades"),
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Dialog open={showOverflow} onOpenChange={setShowOverflow}>
        <DialogContent className="paper-details-dialog">
          <DialogTitle>补充内容</DialogTitle>
          <DialogDescription>
            以下文字超过卡面填写区，完整内容保留在角色记录中。
          </DialogDescription>
          {Object.values(overflow).map((entry) => (
            <section key={entry.key}>
              <h3>{entry.label}</h3>
              <p className="whitespace-pre-wrap break-words">{entry.text}</p>
            </section>
          ))}
        </DialogContent>
      </Dialog>
      {after && <div className="paper-after print:hidden">{after}</div>}
    </section>
  );
}
