import { flushSync } from "react-dom";
import { useSheetAppearanceStore } from "@/lib/sheet-appearance-store";

export type PDFPrintMode = "color" | "mono";

/** Commit the requested palette before the browser captures its print document. */
export async function printSheetPDF(
  mode: PDFPrintMode = "color",
): Promise<void> {
  flushSync(() =>
    useSheetAppearanceStore.getState().update({ printMode: mode }),
  );
  await document.fonts?.ready;
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  window.print();
}
