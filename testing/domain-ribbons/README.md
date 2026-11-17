# Left-side domain ribbon

The compact second-page card now follows the supplied reference: original flag on the left, a large level numeral above the emblem, title to its right, divider, then domain / card category / recall cost. The card keeps its existing 64px height. At 125% device scale the reference example is approximately 234 × 80px. The ribbon is 37 × 58px and reserves 46px for itself, avoiding overlays on card text.

The same shared ribbon appears in text and illustrated exports. Print headings reserve enough space for the flag; long titles wrap instead of clipping. Level numbers remain SVG text, including two-digit and unspecified levels. Pale Bone and Splendor flags use dark numerals. Missing images use a solid fallback, visible number and unchanged textual metadata. The image is decorative to pointer input: clicking/tapping its area selects the card through the existing parent action.

Source changes are limited to shared domain presentation, compact slots, text/illustrated print headings, original-image embedding and generated styles/assets. Existing rules, permissions, saved levels and artwork preferences are unchanged. PNG variants are generated from the supplied original archive; previous WebP assets remain for cached app chunks. HTML exports embed original PNG bytes, avoiding conversion back to WebP by the ordinary illustration encoder.

## Verification

- Ten relevant Vitest files: **40 tests passed**, including PNG preservation in standalone export, failed images, card interaction, legacy cloning, startup prelude and ES2019 syntax guards. TypeScript and the production Next.js build passed; 42 emitted browser chunks passed the syntax check.
- Built-app Chromium checks used ten real domain types, a level-10 card, custom domain and unspecified level. The layout fixture derives display fields from bundled cards; its legacy text-update prompt is explicitly declined to retain the fixture. No alternate application import path is introduced.
- Three profiles: desktop at 125% device scale, mobile with missing early APIs/private-worker access, and blocked ribbon-image requests. Each passed at widths **320 / 360 / 390 / 768 / 1024 / 1440**. Flags fit within cards; titles remain to their right; there is no document/card horizontal overflow. Actual touch taps through the ribbon and closing the picker were checked on mobile profiles. Reload/import passed in the legacy profile; no uncaught page errors occurred.
- Legacy profile removes structuredClone, crypto.randomUUID, queueMicrotask, globalThis, AbortController/Signal and modern MediaQueryList listeners. It also models the old EventTarget behavior that ignores the signal listener option; retaining a modern native AbortSignal brand check with a polyfilled signal was an inconsistent simulation and was corrected. Existing optional worker access is blocked deliberately and logged without preventing editing.
- Text/illustrated HTML snapshots each replayed offline with **zero external HTTP requests**; both ribbon images were positively counted and decoded as embedded PNG, with SVG levels intact. Export marker attributes are sanitized, so offline checks use the actual ribbon class rather than vacuously testing removed attributes.
- Color and monochrome PDFs, with background printing disabled, each have **three A4 pages**. Both level numerals remain selectable text. Rasterized monochrome card pages contain zero pixels with RGB differences above 8.

## Coverage limit

Only Chromium is executable in this environment. Firefox/WebKit installation was attempted, but the browser CDN returned `403 Domain forbidden`; the installation log is retained. These viewport/API simulations are **not** claims of testing real Safari, Firefox, Huawei/Vivo/Quark devices, or an entire old browser's rendering engine. PNG specifically removes WebP requirements for the ribbon; other existing image formats retain their existing behavior. The managed browser blocks `file://`, so offline HTML was verified in an opaque document instead of OS double-click.

[Reference-style card](desktop-125-percent-card.png) · [Domain matrix](desktop-125-percent-deck.png) · [Mobile](legacy-mobile-apis-card.png) · [Missing-image fallback](blocked-ribbon-images-card.png) · [Exported cards](illustrated-color-cards.png) · [Monochrome export](text-mono-cards.png)

Structured results and logs are adjacent. Full export files remain in `/workspace/deliverables/DHsheet-ribbon-style`. Artwork is from the supplied archive and existing cards; no generated portrait or illustration is used.
