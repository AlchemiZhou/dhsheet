# Original profession banners and a shorter electronic sheet

The thirteen profession banners are extracted losslessly from the newly supplied printable PDFs at 400 dpi. `public/print-templates/profession-headers/sources.json` records source filenames, SHA-256 hashes, crop bounds and the original banner polygon. The online button displays the crop at its original PDF-point-to-CSS-pixel size (198.323074 × 55.553215 pt), clipped to the original wedge. This retains the actual printed icons, font shapes, sizes and relative positions. Custom profession names still use the editable text control because an original image cannot display a user's replacement name. The same control opens the profession picker.

Selecting a subclass already synchronizes the stored spellcasting mark through the existing semantic selection action. The attribute component now exposes that state for a colored heading, border and “施法属性” caption, including immediate updates when switching subclasses and clearing non-casting selections. Attribute values and save format are unchanged.

Life and stress each keep all twelve cells on a single row. The compact form reduces section spacing and empty writing-line height. Empty reserve weapons, future upgrade options and excess empty card slots can be expanded; owned cards and populated reserve weapons remain visible. One available card slot always remains accessible. These controls affect the electronic view, not the native PDF layout or stored contents.

## Verification

- All thirteen banner WebP files are pixel-identical to their source PDF crops; the generator is `scripts/extract-profession-headers.py`.
- 62 related Vitest tests passed, covering spellcasting changes/clearing, resource limits and cumulative marking, card-slot expansion, selection, equipment, print portraits and story/upgrades.
- Production Next.js build and TypeScript validation passed. All 42 browser chunks passed ES2019 syntax validation.
- Actual UI checks: all thirteen profession banners loaded at the original physical size; spellcasting changed Knowledge → Agility → Knowledge and cleared for a non-caster; all twelve resource cells remained in one row.
- Both pages had no horizontal page overflow at 320, 390, 768, 1024 and 1440 px widths. Reserve weapons, upgrade options, empty slots and the spare-slot card picker remained accessible.
- Native offline HTML/PDF still used the original two-sheet renderer with the page-two portrait and a separate card page. No browser page errors.

For the same sample character at 794 px paper width, the default front page shrank from 1547 px to about 1119 px (28%), and the back from 1856 px to about 1274 px (31%). Expanded sections and longer character text naturally add height. These are Chromium measurements and viewport emulation, not real-device Safari/Android validation. The managed browser blocks file://; offline HTML was replayed without network in an opaque document.
