"use client";
import type React from "react";
import type { SheetData } from "@/lib/sheet-data";
import { useSheetStore } from "@/lib/sheet-store";
import { createProfessionStory } from "@/character/profession-setup/story";

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
            <h3 className="text-center text-sm font-bold mb-1">
              {group === "background" ? "背景问题" : "关系"}
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              {group === "background"
                ? "回答任意问题，也可以编辑问题描述。"
                : "询问同伴玩家，让其角色回答，也可以自行改写。"}
            </p>
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
          </div>
        ))}
      </div>
      {[
        formData.characterBackground,
        formData.characterAppearance,
        formData.characterMotivation,
      ].some(Boolean) && (
        <details className="mt-2 text-sm">
          <summary>原角色简介、特质与冒险笔记</summary>
          {(
            [
              "characterBackground",
              "characterAppearance",
              "characterMotivation",
            ] as const
          ).map((field, i) => (
            <label className="block mt-2" key={field}>
              {["角色简介", "角色特质", "冒险笔记"][i]}
              <textarea
                className="block w-full rounded border p-2"
                rows={3}
                value={formData[field] ?? ""}
                onChange={(event) =>
                  setSheetData({ [field]: event.target.value })
                }
              />
            </label>
          ))}
        </details>
      )}
    </section>
  );
}
