import { describe, expect, it } from "vitest";
import { defaultSheetData } from "@/lib/default-sheet-data";
import { migrateSheetData } from "@/lib/sheet-data-migration";
import {
  createProfessionStory,
  normalizeProfessionStory,
  storyAnswersToDraft,
  storyWritingModes,
} from "../story";

describe("story writing modes", () => {
  it("defaults new sheets to prompts and exposes old biography fields as continuous prose", () => {
    expect(storyWritingModes(defaultSheetData)).toEqual({
      background: "questions",
      connections: "questions",
    });
    expect(
      storyWritingModes({
        characterBackground: "旧故事",
        characterAppearance: "旧外貌",
      }),
    ).toEqual({ background: "free", connections: "profile" });
    const story = {
      ...createProfessionStory(),
      backgroundMode: "questions" as const,
    };
    expect(
      storyWritingModes({
        professionStory: story,
        characterBackground: "保存的另一份草稿",
      }).background,
    ).toBe("questions");
  });
  it("preserves modes, question answers and continuous text through saved-sheet migration and profession replacement", () => {
    const story = {
      ...createProfessionStory(),
      backgroundMode: "free" as const,
      connectionsMode: "profile" as const,
    };
    story.background[0] = { question: "改过的问题", answer: "旧回答" };
    const data = migrateSheetData(
      JSON.parse(
        JSON.stringify({
          ...defaultSheetData,
          professionStory: story,
          characterBackground: "连续故事\n第二段",
          characterAppearance: "外貌",
        }),
      ),
    );
    expect(data.professionStory).toEqual(story);
    expect(data.characterBackground).toBe("连续故事\n第二段");
    expect(data.characterAppearance).toBe("外貌");
    expect(
      createProfessionStory(undefined, data.professionStory),
    ).toMatchObject({
      backgroundMode: "free",
      connectionsMode: "profile",
      background: [
        { question: "", answer: "旧回答" },
        { question: "", answer: "" },
        { question: "", answer: "" },
      ],
    });
    expect(
      normalizeProfessionStory({ backgroundMode: "bad", connectionsMode: 42 }),
    ).toMatchObject({
      backgroundMode: "questions",
      connectionsMode: "questions",
    });
  });
  it("assembles an optional prose draft only from answered prompts", () => {
    expect(
      storyAnswersToDraft([
        { question: "过去？", answer: "在森林长大。" },
        { question: "空白", answer: "  " },
        { question: "", answer: "第二段\n后半段" },
      ]),
    ).toBe("过去？\n在森林长大。\n\n第二段\n后半段");
  });
});
