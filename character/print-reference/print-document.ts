import { flushSync } from "react-dom";
import { useSheetAppearanceStore } from "@/lib/sheet-appearance-store";

export type PDFPrintMode = "color" | "mono";

/** Recheck the mounted images because card artwork may switch to a fallback. */
async function waitForPrintImages(): Promise<void> {
  const deadline = Date.now() + 10_000;
  while (true) {
    const pending = Array.from(document.querySelectorAll<HTMLImageElement>(".print-pages-scroll-content img"))
      .find(image => !image.complete || !image.naturalWidth);
    if (!pending) return;
    if (Date.now() >= deadline) {
      throw new Error("「" + (pending.alt || "角色卡图片") + "」尚未加载成功，请等待图片显示后重试。");
    }
    await new Promise<void>(resolve => setTimeout(resolve, 100));
  }
}

/** Commit the requested palette and wait for the mounted print assets. */
export async function preparePrintDocument(
  mode: PDFPrintMode = "color",
): Promise<void> {
  flushSync(() =>
    useSheetAppearanceStore.getState().update({ printMode: mode }),
  );
  await document.fonts?.ready;
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await waitForPrintImages();
}

export async function printSheetPDF(mode: PDFPrintMode = "color"): Promise<void> {
  await preparePrintDocument(mode);
  if (typeof window.print !== "function") {
    throw new Error("此浏览器没有提供打印功能。可导出 HTML 后，在支持打印的浏览器中打开。");
  }
  window.print();
}
