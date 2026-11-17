import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PaperSheetEditor } from "../paper-sheet-editor";
import { useSheetStore } from "@/lib/sheet-store";
import { defaultSheetData } from "@/lib/default-sheet-data";
import {
  professionCardConverter,
  type ProfessionCard,
} from "@/card/profession-card/convert";
import base from "@/data/cards/builtin-base.json";
const device = vi.hoisted(() => ({ mobile: false }));
vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => device.mobile }));
vi.mock("@/components/print/reference-sheet", () => ({
  ReferenceSheet: () => <div aria-label="原版卡面" />,
  Tick: () => null,
}));
const init = () => {
  const sheet = structuredClone(defaultSheetData);
  sheet.name = "原来的姓名";
  sheet.cards[0] = professionCardConverter.toStandard(
    (base.profession as ProfessionCard[]).find((c) => c.名称 === "战士")!,
  );
  useSheetStore.setState({ sheetData: sheet });
};
afterEach(cleanup);
beforeEach(() => {
  device.mobile = false;
  init();
});
const renderEditor = () =>
  render(
    <PaperSheetEditor page={1} onDetails={vi.fn()} onEquipment={vi.fn()}>
      <div>完整自定义编辑器</div>
    </PaperSheetEditor>,
  );
describe("original-layout editable sheet", () => {
  it("edits names in place and retains attribute submission behavior", () => {
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "编辑姓名" }));
    const name = screen.getByRole("textbox", { name: "编辑姓名" });
    fireEvent.change(name, { target: { value: "修改后的姓名" } });
    fireEvent.blur(name);
    expect(useSheetStore.getState().sheetData.name).toBe("修改后的姓名");
    fireEvent.click(screen.getByRole("button", { name: "编辑敏捷" }));
    const attribute = screen.getByRole("textbox", {
      name: "编辑敏捷",
    });
    fireEvent.change(attribute, { target: { value: "3" } });
    fireEvent.blur(attribute);
    expect(Number(useSheetStore.getState().sheetData.agility?.value)).toBe(3);
  });
  it("uses a readable mobile editor with explicit save and cancel", () => {
    device.mobile = true;
    renderEditor();
    fireEvent.click(screen.getByRole("button", { name: "编辑姓名" }));
    fireEvent.change(screen.getByRole("textbox", { name: "编辑姓名" }), {
      target: { value: "取消的草稿" },
    });
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    expect(useSheetStore.getState().sheetData.name).toBe("原来的姓名");
    fireEvent.click(screen.getByRole("button", { name: "编辑姓名" }));
    fireEvent.change(screen.getByRole("textbox", { name: "编辑姓名" }), {
      target: { value: "手机保存" },
    });
    fireEvent.click(screen.getByRole("button", { name: "完成" }));
    expect(useSheetStore.getState().sheetData.name).toBe("手机保存");
  });
  it("wires the native switches and exposes card configuration only when enabled", () => {
    const mixed = vi.fn(),
      transformation = vi.fn(),
      details = vi.fn(),
      configure = vi.fn();
    render(
      <PaperSheetEditor
        page={1}
        onDetails={details}
        onMixedChange={mixed}
        onTransformationChange={transformation}
        onConfigureTransformation={configure}
      >
        <div>完整自定义编辑器</div>
      </PaperSheetEditor>,
    );
    expect(screen.queryByRole("button", { name: "选择转变卡" })).toBeNull();
    fireEvent.click(screen.getByRole("switch", { name: "混血" }));
    fireEvent.click(screen.getByRole("switch", { name: "转变" }));
    expect(mixed).toHaveBeenCalledWith(true);
    expect(transformation).toHaveBeenCalledWith(true);
    act(() =>
      useSheetStore
        .getState()
        .setSheetData({ mixedAncestry: true, transformationEnabled: true }),
    );
    fireEvent.click(screen.getByRole("button", { name: "选择混血种族" }));
    expect(details).toHaveBeenCalledWith("identity");
    fireEvent.click(screen.getByRole("button", { name: "选择转变卡" }));
    expect(configure).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("switch", { name: "混血" }));
    expect(mixed).toHaveBeenLastCalledWith(false);
  });
  it("does not replace custom profession rules with a stock PDF", () => {
    act(() =>
      useSheetStore.setState((state) => ({
        sheetData: {
          ...state.sheetData,
          cards: state.sheetData.cards.map((card, i) =>
            i === 0 ? { ...card, description: "用户自己的完整职业规则" } : card,
          ),
        },
      })),
    );
    renderEditor();
    expect(screen.getByText("完整自定义编辑器")).toBeTruthy();
    expect(screen.queryByLabelText("原版卡面")).toBeNull();
  });
});
