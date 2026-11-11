import { afterEach, describe, expect, it, vi } from "vitest";
import { embedReferencePrintFonts } from "../embed-font";

afterEach(() => vi.unstubAllGlobals());

describe("portable reference font", () => {
  it("embeds the font once across both pages and needs no site URL", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        blob: async () => new Blob(["test-font"], { type: "font/woff2" }),
      });
    vi.stubGlobal("fetch", fetch);
    const root = document.createElement("div");
    root.innerHTML =
      '<style data-reference-font="/print-templates/form-ink.woff2">@font-face{src:url(/print-templates/form-ink.woff2)}</style>'.repeat(
        2,
      );
    await embedReferencePrintFonts(root);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(root.querySelectorAll("style")).toHaveLength(1);
    expect(root.innerHTML).toContain("data:font/woff2;base64,");
    expect(root.innerHTML).not.toContain("/print-templates/");
  });

  it("reports missing assets instead of silently producing an incomplete export", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
    const root = document.createElement("div");
    root.innerHTML = '<style data-reference-font="/missing.woff2"></style>';
    await expect(embedReferencePrintFonts(root)).rejects.toThrow("404");
  });
});
