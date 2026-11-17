# Compact header and domain identifiers

Incremental adjustments to the restored editable sheet, without the reverted full-PDF editing surface.

- Desktop identity fields now use two 35px rows: name / ancestry / mixed ancestry, then community / subclass / transformation. Flexible field widths replace the previous third row. The original 264.431 × 74.071px profession artwork stays at its original scale. The level frame and button match its combined height. Enabling mixed ancestry or a transformation keeps two rows; transformation selection stays beside its switch. Mobile retains readable labels and touch targets.
- Attribute headings have 6px horizontal insets. The spellcasting caption sits above its heading with separation from the identity rule. Equipment features use 14px text, matching adjacent equipment values. Frame accents use the selected primary color; ordinary fields stay neutral.
- The deck precedes upgrade options on page two. Empty ordinary slots show “点击添加新领域卡” and support mouse, Enter and Space. Card rows have space for existing special-slot tags. Domain slots replace the duplicate floating domain/level tag with one identifier inside the card.
- Shared domain labels use each card's own domain and saved level, independently of the selected profession. They appear in online compact slots and both illustrated/text export cards. Nine ribbon images come from the supplied archive; Dread uses the existing skull icon and project color, and custom domains keep their own text with a neutral indicator. Legacy LV metadata is read only when no saved level exists; missing levels stay unspecified. No character data, domain permissions or calculations change.
- Ribbon identifiers remain visible when optional card illustrations are hidden. HTML embeds their assets. Monochrome exports neutralize domain rules, Markdown emphasis and card borders as well as illustrations; domain names and levels remain actual text.
- The author action is once again the last small line of the existing credits, with inherited font/color, no floating frame. Its remembered artwork preference, notifications and existing More-menu alternative remain.

Source changes: `header-section.tsx`, `native-editor.css`, `character-sheet-page-two.tsx`, compact deck, shared `DomainCardLabel` / presentation metadata, text/illustrated print cards, and existing attribution component/layout. `prepare-domain-labels.py` reproducibly extracts only the nine named image assets; `public/domain-labels/source.json` records source hashes. Embedded export styles were regenerated.

## Checks

- Related 8-file suite: 29 tests passed. The subsequently added keyboard interaction was checked with the 5-test card-deck suite. Theme checks and exact commands/results are in adjacent logs.
- TypeScript and production Next.js build passed; browser syntax guard verified 42 chunks at ES2019.
- Built-app Chromium: header row positions and complete profession-image container checked; both switches keep the same header height; spellcasting caption clears the upper rule; equipment text is 14px; primary-color rules match the profession. Empty-slot selection and final upgrade order passed.
- Widths 320, 390, 768, 1024 and 1440: both pages stay within the document width. Viewport checks are not a substitute for testing every physical phone/browser.
- Both illustrated and text HTML exports replayed offline with zero external HTTP requests, including the embedded ribbon images. Color and monochrome PDF runs with background printing disabled each have three A4 pages. Domain/level strings remain selectable PDF text. Monochrome card pages contain zero pixels with RGB channel differences above 8.

Previews: [two-row header](header.png), [transformation selected](header-enabled.png), [front](desktop-front.png), [back](desktop-back.png), [mobile](mobile-page.png), [exported card page](illustrated-color-cards.png), [monochrome cards](text-mono-cards.png).

Export files remain under `/workspace/deliverables/DHsheet-ui-refinement`. The portrait and illustrations are existing card artwork; no generated illustration is used. The managed browser prohibits `file://`, so standalone HTML was tested in an offline opaque document instead of by OS double-click.
