# Original PDF layout as the online editor

The user's latest direction replaces the complete first/back-page arrangement, including the identity fields, with the supplied original PDFs. The online editor now reuses the same `ReferenceSheet` renderer and PDF-point coordinates as export. Stock profession logos, icons, printed type and borders remain the original artwork; transparent controls edit values at their original positions.

- All thirteen stock professions use this surface. A cleared profession or custom/modified profession rule text retains the complete existing form, because a fixed stock PDF would otherwise conceal custom rules. This is an isolated, tested content-preservation case.
- Per the final request, community and subclass values are shortened only online. Their right-hand ends and the two new 混血／转变 switch frames reuse the original chamfer geometry, rule weight, label font and per-profession source palette. Off is an empty original-style checkbox; on is checked. Mixed ancestry exposes configuration; enabling transformation opens its picker, and its arrow allows reselection. Flags use the existing saved state and selection actions. Export preserves the full original fields and includes the selected transformation in the card deck.
- Native identity fields launch the existing profession/ancestry/community/subclass selectors. Equipment-name areas launch existing selectors; other equipment areas open the existing detailed editor. Modifiers and attribute auto-base behavior use the same commit paths as before.
- Life and stress each occupy one original row, up to twelve slots. Armor, proficiency, hope, coins and attribute-upgrade marks are interactive. Existing undo/redo and autosave remain active.
- The second page retains the requested square portrait and supports original questions, editable answers, free-form background/profile modes and upgrade controls. Long text stays in saved data and is accessible through supplementary content; export retains its continuation behavior. The deck remains below the second card, outside its A4 surface.
- Stock attribute headings stay untouched when they match the selected subclass. Different spellcasting attributes use glyphs extracted from the original PDF, updated immediately and shared with exports. Original label font and neutral headings are source-PDF assets, not approximate system-font replacements.
- Mobile fit-width preserves the original page proportions. Zoom/pan allows closer reading; selecting a value opens a normal-size save/cancel editor. Additional settings remain outside the printed card. Older browsers have a window-resize fallback when ResizeObserver is unavailable.
- Manual original-form extras (patron, prayer dice, etc.) use additive optional `referenceFieldValues` text data. Old saves normalize to an empty map; malformed values fail validation; only known extra fields project into the card. These notes do not alter rules or numeric calculations.
- Following the user's final adjustment, “由 炼金术士阿刻米 特调” is the last small attribution line, inheriting the other credits' size and color. The floating framed button is removed. Its persistent artwork toggle, notifications and existing More-menu alternative remain.

## Source assets

Original full-resolution backgrounds remain unchanged. `scripts/prepare-screen-reference-templates.py` makes lossless 1600px screen versions, selected responsively to avoid decoding print-size artwork on every phone. `scripts/extract-paper-attribute-headings.py DIRECTORY_WITH_PRINT_PDFS` extracts six neutral headers, the caption and original SheetSansBold TTF. Both scripts read source assets without modifying the PDFs. The printed originals and their artwork retain their existing attribution.

## Verification

- Production Next.js build and TypeScript checks passed. ES2019 browser guard passed for 42 chunks.
- 19 relevant Vitest files: **91 tests passed**, covering field routing, mobile drafts, custom-rule preservation, cumulative resource tracks, modifiers, migration, validation, storage invariants, portable fonts and artwork preference behavior.
- Built-app Chromium checks: all thirteen native profession backgrounds load; in-place editing survives reload; identity/equipment selectors open; twelve-slot tracks, undo/redo, portrait/story/upgrade inspectors and original-form extra notes work.
- Widths 320, 390, 768, 1024 and 1440: both pages have no document overflow. Mobile save/cancel and internal zoom/pan passed.
- Wizard Knowledge and both Assassin subclass attributes checked. Switching to execution immediately highlights Agility; reload preserves it; poison returns to Knowledge. Long background text remains accessible in full.
- Standalone HTML replayed with networking disabled: fonts, header glyphs, portrait and saved content load with **zero external HTTP requests**. Tools are absent from export. Color and monochrome PDF runs each have three A4 pages with browser background printing disabled. Rasterized monochrome output contains zero colored pixels.
- Banner comparison against the supplied warrior print PDF: source glyphs/geometry are retained; mean RGB pixel difference is about 4–4.5 / 255 at 96 dpi, including different raster sampling. This is not a claim that editable text or rasterized previews are vector-identical.

The managed browser blocks `file://`; HTML was tested offline in an opaque document, not by OS double-click. Responsive Chromium checks do not establish coverage of every physical Huawei, Vivo or Safari device.

## Previews

[Header switches](native-switches.png) · [Credits](credit.png) · [Front](desktop-front.png) · [Back](desktop-back.png) · [Mobile](mobile-page.png) · [Subclass spellcasting](assassin-spellcasting.png)

Structured results and build/test logs are adjacent. The example portrait is existing card artwork; no generated illustration is used.
