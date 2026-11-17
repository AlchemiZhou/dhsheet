# Domain level numeral alignment

The shared ribbon numeral now uses Arial / Helvetica / sans-serif bold, replacing platform-dependent Arial Black / weight 900. Single digits are 19 SVG units, two-digit levels 17, with the baseline moved from y=25 to y=21. The common x=18.5 anchor centers both within the 37 × 58 viewBox. Page-two slots and text/illustrated exports all use this same component. Original artwork, titles, descriptions, levels and saved data are unchanged.

## Verification

- Seven existing tests passed across domain identifiers, artwork preferences and HTML layout. Production Next build/type check and syntax checks for all 42 ES2019 chunks passed.
- A built-app fixture supplied actual rendered labels for all nine supplied domain flags, Dread and a custom-domain fallback. A matrix cloned those shared labels to inspect every level 1–10 at compact and enlarged dimensions (110 combinations). Canvas ink metrics, rather than SVG font line boxes that include unused descender space, confirmed all numerals end at or above y=21, remain inside x=6..31 and are centered within 0.72 SVG units. Visual inspection included the taller Codex emblem and the two-digit level 10.
- The live fixture retained its original level-10 font size and shared anchors at widths 320, 390, 768, 1024 and 1440; no horizontal page overflow occurred.
- Actual exported HTML opened offline with zero external HTTP requests. Its Codex numeral uses the updated baseline and size, original PNG flag and embedded illustration. Screen/print layouts fit the complete Book of Illiat description. Text/illustrated × color/monochrome PDFs each contain three A4 pages.
- Chromium was available; this does not claim physical Safari/Huawei/Vivo/Quark device testing.

[All 110 combinations](all-domains-levels-1-10.png) · [Compact size](all-domains-levels-compact.png) · [Actual exported Codex card](exported-domain-card.png)
