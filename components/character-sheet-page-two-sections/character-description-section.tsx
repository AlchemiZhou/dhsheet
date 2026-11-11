"use client";
import type React from "react";
import type { SheetData } from "@/lib/sheet-data";
import { useSheetStore } from "@/lib/sheet-store";
import {
  createProfessionStory,
  storyWritingModes,
  storyAnswersToDraft,
} from "@/character/profession-setup/story";

import { FreeStoryEditor } from "./free-story-editor";

export function CharacterDescriptionSection({
  formData,
}: {
  formData: SheetData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}) {
  const setSheetData = useSheetStore((state) => state.setSheetData);
  const story =
    formData.professionStory ?? createProfessionStory(formData.cards?.[0]);
  const modes = storyWritingModes(formData);
  const setMode = (group: "background" | "connections", value: string) =>
    setSheetData((previous) => ({
      professionStory: {
        ...(previous.professionStory ??
          createProfessionStory(previous.cards?.[0])),
        [group === "background" ? "backgroundMode" : "connectionsMode"]: value,
      },
    }));
  const update = (
    group: "background" | "connections",
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setSheetData((previous) => {
      const current =
        previous.professionStory ?? createProfessionStory(previous.cards?.[0]);
      return {
        professionStory: {
          ...current,
          [group]: current[group].map((entry, i) =>
            i === index ? { ...entry, [field]: value } : entry,
          ),
        },
      };
    });
  };
  return (
    <section className="profession-story-section mt-2 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(["background", "connections"] as const).map((group) => (
          <div key={group}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold">
                {group === "background"
                  ? modes.background === "free"
                    ? "背景故事"
                    : "背景问题"
                  : modes.connections === "profile"
                    ? "角色介绍"
                    : "关系"}
              </h3>
              <select
                aria-label={
                  group === "background" ? "背景写作方式" : "关系或介绍方式"
                }
                value={modes[group]}
                onChange={(e) => setMode(group, e.target.value)}
                className="rounded border border-gray-300 bg-white px-2 py-1 text-sm print:hidden"
              >
                <option value="questions">
                  {group === "background" ? "职业问题" : "关系问题"}
                </option>
                <option value={group === "background" ? "free" : "profile"}>
                  {group === "background" ? "自由背景" : "角色介绍"}
                </option>
              </select>
            </div>
            <p className="mb-2 text-xs text-gray-500 print:hidden">
              {modes[group] === "questions"
                ? "问题只是灵感提示，可改写，也可切换成连续自由写作。"
                : "切换不会删除原来的问答；导出使用当前选择的版式。"}
            </p>
            {modes[group] !== "questions" ? (
              <FreeStoryEditor
                label={group === "background" ? "背景故事" : "角色介绍"}
                value={
                  (group === "background"
                    ? formData.characterBackground
                    : formData.characterAppearance) ?? ""
                }
                onChange={(value) =>
                  setSheetData({
                    [group === "background"
                      ? "characterBackground"
                      : "characterAppearance"]: value,
                  })
                }
                placeholder={
                  group === "background"
                    ? "在这里自由写下角色的过去、重要经历，以及踏上冒险的原因……"
                    : "自由描述角色的外貌、衣着、气质、性格与日常习惯……"
                }
                draft={storyAnswersToDraft(story[group])}
                onUseDraft={() =>
                  setSheetData({
                    [group === "background"
                      ? "characterBackground"
                      : "characterAppearance"]: storyAnswersToDraft(
                      story[group],
                    ),
                  })
                }
              />
            ) : (
              <>
                {story[group].map((entry, index) => (
                  <div
                    key={index}
                    className="mb-2 rounded border border-gray-300 p-2"
                  >
                    <textarea
                      aria-label={`${group === "background" ? "背景问题" : "关系"}${index + 1}描述`}
                      value={entry.question}
                      onChange={(event) =>
                        update(group, index, "question", event.target.value)
                      }
                      rows={2}
                      className="w-full resize-y border-0 bg-gray-50 text-xs font-semibold p-1"
                      placeholder="自行编写问题"
                    />
                    <textarea
                      aria-label={`${group === "background" ? "背景问题" : "关系"}${index + 1}回答`}
                      value={entry.answer}
                      onChange={(event) =>
                        update(group, index, "answer", event.target.value)
                      }
                      rows={3}
                      className="w-full resize-y border-t border-gray-200 text-sm p-1"
                      placeholder="填写回答…"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
      {formData.characterMotivation && (
        <details className="mt-2 text-sm">
          <summary>冒险笔记</summary>
          <textarea
            aria-label="冒险笔记"
            className="w-full rounded border p-2"
            rows={4}
            value={formData.characterMotivation}
            onChange={(e) =>
              setSheetData({ characterMotivation: e.target.value })
            }
          />
        </details>
      )}
    </section>
  );
}
