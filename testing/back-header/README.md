# Shared profession banner and illustrated export layout

Both editable pages now use the same original profession banner component, image and display dimensions (264.431 × 74.071 CSS px). This includes its native lettering, two domain icons and dark background. Custom profession titles retain editable text rather than incorrectly showing a stock image. On narrow screens the back-page description wraps below the intact banner.

Illustrated domain exports place the original domain flag and SVG level number over the top-left of the illustration, with card name and domain/category/recall metadata beneath. The flag scales with the artwork width; text-only cards retain their existing separate flag gutter. No rule, storage or illustration-preference behavior changes.

## Verification

- Existing and focused Vitest checks passed: 37 for profession/header/equipment/appearance/HTML layout, then 12 for profession/header/domain identifiers/artwork preference/HTML layout. Overlapping files are included in both counts.
- TypeScript, production static build and ES2019 checks for all 42 browser chunks passed.
- Built Chromium UI: all 13 professions used identical banner sources and dimensions on both pages. Widths 320, 390, 768, 1024 and 1440 passed without horizontal overflow, banner squeezing or caption overlap. Reload retained the chosen profession.
- Real exported HTML was replayed offline with zero external HTTP requests, positively counted embedded PNG flags, decoded illustrations and SVG levels. Screen and print layouts put the flag wholly over the image and the title below; the three-paragraph Book of Illiat example fits completely.
- Text/illustrated × color/monochrome PDFs each have three A4 pages; final card-page raster and individual card preview were inspected. Asynchronously decoded illustrations require scrolling/allowing a paint before offscreen Playwright screenshots; this is handled in the verification capture rather than by altering the exported document.

Only Chromium is available here. These checks do not claim real Safari, Firefox, Huawei/Vivo or Quark device coverage. Prior WebKit/Firefox installation attempts were blocked by the browser CDN.

[Desktop header](desktop-back-header.png) · [Mobile header](mobile-back-header.png) · [Exported card](exported-domain-card.png) · [Actual A4 card page](illustrated-color-cards.png)
