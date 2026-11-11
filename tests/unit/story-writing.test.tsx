import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CharacterDescriptionSection } from "@/components/character-sheet-page-two-sections/character-description-section";
import { useSheetStore, useSheetHistoryStore } from "@/lib/sheet-store";
import { createProfessionStory } from "@/character/profession-setup/story";
import { resetSheetStore, sheet } from "./automation/test-helpers";

function Story() {
  const formData = useSheetStore((state) => state.sheetData);
  return (
    <CharacterDescriptionSection
      formData={formData}
      handleInputChange={() => {}}
    />
  );
}
describe("continuous story writing", () => {
  beforeEach(() => {
    resetSheetStore({ professionStory: createProfessionStory() });
    useSheetHistoryStore.getState().clear();
  });
  it("switches columns independently, keeps both drafts and supports focus writing and undo", () => {
    render(<Story />);
    fireEvent.change(screen.getByLabelText("背景问题1回答"), {
      target: { value: "原回答" },
    });
    fireEvent.change(screen.getByLabelText("背景写作方式"), {
      target: { value: "free" },
    });
    expect(screen.getByLabelText("关系1回答")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "用已有回答生成背景故事草稿" }),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "用已有回答生成背景故事草稿" }),
    );
    expect(screen.getByLabelText("背景故事")).toHaveValue("原回答");
    fireEvent.click(screen.getByRole("button", { name: "专注写作：背景故事" }));
    fireEvent.change(screen.getByLabelText("背景故事专注编辑"), {
      target: { value: "一个没有分题的故事。\n第二段。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成写作" }));
    expect(screen.getByLabelText("背景故事")).toHaveValue(
      "一个没有分题的故事。\n第二段。",
    );
    fireEvent.change(screen.getByLabelText("背景写作方式"), {
      target: { value: "questions" },
    });
    expect(screen.getByLabelText("背景问题1回答")).toHaveValue("原回答");
    act(() => useSheetHistoryStore.getState().undo());
    expect(screen.getByLabelText("背景故事")).toHaveValue(
      "一个没有分题的故事。\n第二段。",
    );
    fireEvent.change(screen.getByLabelText("关系或介绍方式"), {
      target: { value: "profile" },
    });
    fireEvent.change(screen.getByLabelText("角色介绍"), {
      target: { value: "银发，沉静，喜爱海风。" },
    });
    expect(sheet().characterAppearance).toBe("银发，沉静，喜爱海风。");
    expect(sheet().professionStory?.background[0].answer).toBe("原回答");
  });
});
