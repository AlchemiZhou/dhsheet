import { create, type StoreApi } from "zustand";
import type { SheetData } from "@/lib/sheet-data";

interface SourceState {
  sheetData: SheetData;
  sheetLoadRevision: number;
}
const TEXT_FIELDS = new Set([
  "name",
  "professionStory",
  "experience",
  "inventory",
  "characterBackground",
  "characterAppearance",
  "characterMotivation",
]);
const equal = (a: unknown, b: unknown) =>
  a === b ||
  (typeof a === "object" &&
    typeof b === "object" &&
    JSON.stringify(a) === JSON.stringify(b));

/** Session-only, isolated at character loads. Image storage transactions are not undone. */
export function attachSheetHistory<S extends SourceState>(source: StoreApi<S>) {
  let applying = false;
  let lastEdit = 0;
  let lastKeys = "";
  const history = create<{
    past: SheetData[];
    future: SheetData[];
    undo: () => void;
    redo: () => void;
    clear: () => void;
  }>((set, get) => ({
    past: [],
    future: [],
    clear: () => {
      lastEdit = 0;
      lastKeys = "";
      set({ past: [], future: [] });
    },
    undo: () => {
      const { past, future } = get();
      if (!past.length) return;
      const current = source.getState().sheetData;
      applying = true;
      try {
        source.setState({ sheetData: past[past.length - 1] } as Partial<S>);
      } finally {
        applying = false;
      }
      lastEdit = 0;
      set({ past: past.slice(0, -1), future: [current, ...future] });
    },
    redo: () => {
      const { past, future } = get();
      if (!future.length) return;
      const current = source.getState().sheetData;
      applying = true;
      try {
        source.setState({ sheetData: future[0] } as Partial<S>);
      } finally {
        applying = false;
      }
      lastEdit = 0;
      set({ past: [...past, current].slice(-50), future: future.slice(1) });
    },
  }));
  source.subscribe((current, previous) => {
    if (applying) return;
    if (current.sheetLoadRevision !== previous.sheetLoadRevision) {
      history.getState().clear();
      return;
    }
    if (current.sheetData === previous.sheetData) return;
    const before = previous.sheetData,
      after = current.sheetData;
    if (
      before.characterImage !== after.characterImage ||
      before.companionImage !== after.companionImage ||
      !equal(before.imageAssets, after.imageAssets)
    ) {
      history.getState().clear();
      return;
    }
    const keys = (Object.keys(after) as Array<keyof SheetData>).filter(
      (key) => !equal(before[key], after[key]),
    );
    if (!keys.length) return;
    const now = Date.now(),
      group = keys.sort().join("|");
    const coalesce =
      group === lastKeys &&
      now - lastEdit < 700 &&
      keys.every((key) => TEXT_FIELDS.has(key));
    history.setState((state) => ({
      past: coalesce ? state.past : [...state.past, before].slice(-50),
      future: [],
    }));
    lastKeys = group;
    lastEdit = now;
  });
  return history;
}
