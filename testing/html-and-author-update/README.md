# HTML reader and author action update

New HTML exports use the native character-card layout for the thirteen supported professions, independently of the saved PDF layout preference. Both quick export and preview export apply a temporary render override and restore it after success or failure. Modified/custom profession rules retain their complete live layout to avoid discarding custom content. Existing exported files are snapshots and must be exported again to use the new layout.

The HTML retains embedded fonts, images and character data, including the square portrait on page two. It remains reimportable for editing; the offline file itself is a viewer. The generator preserves the Daggerheart marker required by the existing HTML importer.

The author action is a separate fixed button above the toolbar, with a same-name entry in More. Both use the same persistent artwork preference and notifications. Ordinary attribution stays in the existing credit block.

## Verification

- Eight related Vitest files: 19 tests passed, covering render overrides, failure cleanup, HTML round-trip import, artwork preferences and existing export/storage behavior.
- Production Next.js build and TypeScript checks passed. Browser build guard passed for 42 chunks at ES2019.
- Built-app Chromium check: both HTML export paths use the native layout even when PDF preference is current/live; PDF preference remains unchanged afterward.
- Exported HTML replayed with network disabled in an opaque about:blank document: two native sheets, second-page portrait, portable character data, zero external HTTP requests. Reimport into the app retained the character name and avatar.
- PDF printed from the offline document: three A4 pages including the card page; no extra portrait page.
- Author button geometry and hit testing passed at eight desktop/mobile/landscape viewport sizes. Toggle, reload persistence, notifications and the More entry with the floating button hidden all passed. No browser page errors.

The managed browser blocks file:// navigation. Real desktop double-click was therefore not tested; offline opaque-origin replay is evidence of self-contained assets and scripts, not a claim of OS/file-protocol verification. Viewport emulation also does not replace testing every mobile browser.

Screenshots and structured results are adjacent. The test character uses existing card artwork, without generated art.
