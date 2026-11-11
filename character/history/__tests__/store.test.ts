import { createStore } from "zustand/vanilla";
import { describe, expect, it } from "vitest";
import { attachSheetHistory } from "../store";
import { defaultSheetData } from "@/lib/default-sheet-data";
function setup() {
  const source = createStore(() => ({
    sheetData: structuredClone(defaultSheetData),
    sheetLoadRevision: 0,
  }));
  return { source, history: attachSheetHistory(source) };
}
describe("character edit history", () => {
  it("undoes and redoes a whole profession/equipment transaction", () => {
    const { source, history } = setup();
    const before = source.getState().sheetData;
    source.setState({
      sheetData: {
        ...before,
        profession: "new",
        equipment: {
          ...before.equipment,
          weaponSlots: {
            ...before.equipment.weaponSlots,
            primary: {
              ...before.equipment.weaponSlots.primary,
              name: "新武器",
            },
          },
        },
      },
    });
    history.getState().undo();
    expect(source.getState().sheetData).toBe(before);
    history.getState().redo();
    expect(source.getState().sheetData.equipment.weaponSlots.primary.name).toBe(
      "新武器",
    );
  });
  it("coalesces typing, invalidates redo after a new edit", () => {
    const { source, history } = setup();
    source.setState((s) => ({ sheetData: { ...s.sheetData, name: "A" } }));
    source.setState((s) => ({ sheetData: { ...s.sheetData, name: "AB" } }));
    expect(history.getState().past).toHaveLength(1);
    history.getState().undo();
    expect(source.getState().sheetData.name).toBe("");
    source.setState((s) => ({ sheetData: { ...s.sheetData, name: "C" } }));
    expect(history.getState().future).toHaveLength(0);
  });
  it("clears history across character loads and image storage transactions", () => {
    const { source, history } = setup();
    source.setState((s) => ({ sheetData: { ...s.sheetData, name: "A" } }));
    source.setState({
      sheetData: structuredClone(defaultSheetData),
      sheetLoadRevision: 1,
    });
    expect(history.getState().past).toHaveLength(0);
    source.setState((s) => ({ sheetData: { ...s.sheetData, name: "B" } }));
    source.setState((s) => ({
      sheetData: {
        ...s.sheetData,
        characterImage: "data:image/png;base64,xxx",
      },
    }));
    expect(history.getState().past).toHaveLength(0);
  });
  it("does not record storage-only clones and bounds retained edits", () => {
    const { source, history } = setup();
    source.setState((s) => ({ sheetData: structuredClone(s.sheetData) }));
    expect(history.getState().past).toHaveLength(0);
    for (let i = 0; i < 60; i++)
      source.setState((s) => ({ sheetData: { ...s.sheetData, hope: i } }));
    expect(history.getState().past).toHaveLength(50);
  });
  it("resets when a load revision changes without replacing the sheet object", () => {
    const { source, history } = setup();
    source.setState((s) => ({ sheetData: { ...s.sheetData, name: "A" } }));
    expect(history.getState().past).toHaveLength(1);
    source.setState({ sheetLoadRevision: 1 });
    expect(history.getState().past).toHaveLength(0);
  });
});
