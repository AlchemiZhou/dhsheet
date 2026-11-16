# Editable native character-card layout

The online front and back pages now follow the native printed card hierarchy. The front places identity and six neutral attributes across the top; life, stress, hope, experiences, gold and profession features run down the left, with equipment and inventory on the right. Section frames use the printed card's bevelled headings. The profession banner uses a large white name and two white domain glyphs on the angular primary-color block, while remaining the existing profession picker.

The back starts with the existing 45 mm square portrait editor, then starting-item guidance and a link to the existing character introduction mode. Editable background questions, relationships, free writing, and upgrade bands remain, followed by the existing card deck. Phones stack the same sections and retain the existing touch-size controls. Header hover previews are suppressed on mobile widths.

This is an editable, responsive layout; it expands for control sizes and long text instead of forcing the online form to a fixed paper height. The native two-page PDF/HTML export uses its existing renderer and positions. No save schema, game calculation or card/equipment selection semantics were changed. Portrait actions retain their character-id checks and image repository boundary after moving to page two.

## Checks

- 76 related Vitest tests passed across equipment editing, character storage, autosave, story modes, upgrade bands, card previews and print behavior. The 18 equipment/story/preview tests also passed after the final profession-title changes.
- Production Next.js build and TypeScript validation passed. All 42 browser chunks passed the ES2019 build guard.
- Built-app browser checks passed for name editing and autosave/reload; life marks with undo/redo; opening weapon and armor selectors; editing story/profile content; and exporting the same character to native HTML/PDF with the page-two portrait and edited text.
- First and second pages had no horizontal page overflow at 320, 390, 768, 1024 and 1440 px widths.
- All thirteen professions were selected through the real picker and matched their configured primary theme.
- Removing the avatar through the new page-two editor remained deleted after reload, verifying the character-id/image-action wiring.
- No browser page errors. Structured browser results and desktop/mobile captures are adjacent.

Browser checks use Chromium and viewport emulation, not actual Safari or Android browser devices. Exported HTML was replayed offline in an opaque document; the managed browser blocks direct file:// navigation.

Later banner fidelity and compact-layout changes: [compact editor](../compact-editor/README.md).
