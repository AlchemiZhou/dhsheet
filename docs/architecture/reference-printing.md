# Reference character sheets

`character/profession-setup` maps the 13 built-in professions to the supplied character-sheet recommendations. Selecting a profession updates editable story prompts; a separate app preference (on by default) controls attribute and active equipment replacement. Loading a save never reapplies recommendations. Story answers and old biography notes are retained.

`character/history` holds at most 50 session snapshots, coalesces text edits, and resets on character loads and image transactions. History is not part of saved character data.

Story columns independently select guided questions or continuous prose. Optional `professionStory.backgroundMode` / `connectionsMode` preserve the selection; prose uses the existing `characterBackground` / `characterAppearance` fields. Legacy prose opens in its continuous mode unless an explicit mode was saved. Switching modes never deletes either draft. Print overlays replace only the selected question column and title, preserve the original outer artwork, and keep prose at least 9 pt; excess text is repeated in full after the card pages. Inactive drafts are not printed.

`character/print-reference` projects live values and marks into the original form coordinates. `components/print/reference-sheet` uses widget-free, lossless 400 dpi artwork for the first two A4 pages. The optional Ranger companion page also uses its supplied print artwork, with a square portrait and the existing live companion data. Other card and optional-page renderers remain in use. Long text, legacy notes and portraits use continuation pages. Unsupported professions or edited profession rules use the existing sheet renderer to preserve their rules.

`public/print-templates` contains 27 page backgrounds and the original form font subset with its license. The font loads only in print preview. Standalone HTML embeds backgrounds and one font copy, so it remains portable. Color and monochrome PDF actions commit the requested print palette before the browser captures the document; both the main export menu and preview toolbar expose them directly.

The artwork, live fields and marks share the full A4 canvas without added paper insets. All pages use the same unnamed zero-margin A4 page rule, including standalone HTML. Ordinary pages use 5 mm internal padding and a 200 mm content width. Do not reintroduce named pages, differing page margins or print-time zoom: Safari can change fragmentation and scale when switching from Letter to A4. Paper selection itself remains controlled by the OS print dialog. The original artwork is preserved without added frame edges. Equipment feature text fills the original two writing rows separately, including the second row's label indentation; unfit text retains its complete continuation entry.

Regenerate assets and `data/character/profession-presets.json` from the 13 supplied fillable PDFs:

```sh
python3 scripts/prepare-reference-templates.py DIRECTORY_WITH_PDFS
```

Python dependencies: PyMuPDF, Pillow, fonttools with Brotli support. Source PDFs are not shipped. The generator removes all sample-filled widgets and clears the six fixed story prompts before rendering artwork. Do not rasterize filled samples into the backgrounds.

Regenerate the companion background with `python3 scripts/prepare-companion-template.py RANGER_PRINT.pdf`. It replaces the original wide portrait box with a square and leaves room for the existing description.
