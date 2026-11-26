import { waitForPrintImages } from './print-images'
import { flushSync } from "react-dom";
import { useSheetAppearanceStore } from "@/lib/sheet-appearance-store";

export type PDFPrintMode = "color" | "mono";

/** Commit the requested palette and wait for the mounted print assets. */
export async function preparePrintDocument(
  mode: PDFPrintMode = "color",
): Promise<void> {
  flushSync(() =>
    useSheetAppearanceStore.getState().update({ printMode: mode }),
  );
  await document.fonts?.ready;
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  const preview = document.querySelector('.print-pages-scroll-content');
  if (!preview) throw new Error('未找到角色卡预览。');
  await waitForPrintImages(preview);
}

export async function printSheetPDF(mode: PDFPrintMode = "color"): Promise<void> {
  await preparePrintDocument(mode);
  if (typeof window.print !== "function") {
    throw new Error("此浏览器没有提供打印功能。可导出 HTML 后，在支持打印的浏览器中打开。");
  }
  window.print();
}
