import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { NativeBackHeader } from "../native-back-header";
import { useSheetStore } from "@/lib/sheet-store";
import { defaultSheetData } from "@/lib/default-sheet-data";
import { createEmptyCard } from "@/card/card-types";

afterEach(cleanup);
describe("native back-page profession banner", () => {
  const setName = (name: string) => {
    const data = structuredClone(defaultSheetData);
    const card = {
      ...createEmptyCard("profession"),
      id: "bard",
      class: "吟游诗人",
      name: "吟游诗人",
      cardSelectDisplay: { item1: "优雅", item2: "典籍", item3: "" },
    };
    data.cards[0] = card;
    data.professionRef = { id: card.id, name };
    useSheetStore.setState({ sheetData: data });
  };
  it("shows the original profession image and keeps the page description separate", () => {
    setName("吟游诗人");
    render(<NativeBackHeader />);
    const image = screen.getByRole("img", { name: "吟游诗人，优雅、典籍" });
    expect(image.getAttribute("src")).toContain(
      "/profession-headers/bard.webp",
    );
    expect(screen.getByText("角色头像、背景与关系")).toBeTruthy();
  });
  it("keeps an edited profession title visible", () => {
    setName("巡游乐师");
    render(<NativeBackHeader />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("巡游乐师")).toBeTruthy();
  });
});
