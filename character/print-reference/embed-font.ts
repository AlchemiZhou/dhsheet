export async function readPrintAssetDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`打印资源加载失败 (${response.status})`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("打印资源读取失败"));
    reader.readAsDataURL(blob);
  });
}
/** Make the standalone HTML independent of the website, including its original form font. */
export async function embedReferencePrintFonts(root: ParentNode) {
  const styles = Array.from(
    root.querySelectorAll<HTMLStyleElement>("style[data-reference-font]"),
  );
  const data = new Map<string, string>();
  for (const style of styles) {
    const url = style.getAttribute("data-reference-font")!;
    if (data.has(url)) {
      style.remove();
      continue;
    }
    const encoded = await readPrintAssetDataUrl(url);
    data.set(url, encoded);
    style.textContent = style.textContent?.replace(url, encoded) ?? "";
    style.removeAttribute("data-reference-font");
  }
}
