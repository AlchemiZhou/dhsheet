# Reference character sheets

`character/profession-setup` maps the 13 built-in professions to the supplied character-sheet recommendations. Selecting a profession updates editable story prompts; a separate app preference (on by default) controls attribute and active equipment replacement. Loading a save never reapplies recommendations. Story answers and old biography notes are retained.

`character/history` holds at most 50 session snapshots, coalesces text edits, and resets on character loads and image transactions. History is not part of saved character data.

`character/print-reference` projects live values and marks into the original form coordinates. `components/print/reference-sheet` uses widget-free, lossless 400 dpi artwork for the first two A4 pages. Existing card and optional-page renderers remain in use. Long text, legacy notes and portraits use continuation pages. Unsupported professions or edited profession rules use the existing sheet renderer to preserve their rules.

`public/print-templates` contains 26 page backgrounds and the original form font subset with its license. The font loads only in print preview. Standalone HTML embeds backgrounds and one font copy, so it remains portable. Color and monochrome use the existing print setting.

The artwork, live fields and marks share a 200 mm canvas centered with 5 mm paper insets. Ordinary pages use their own local print scale to fit 5 mm margins, preventing Chromium from shrinking the entire mixed-page document. Missing outer artwork strokes are continued inside the canvas. Equipment feature text fills the original two writing rows separately, including the second row's label indentation; unfit text retains its complete continuation entry.

Regenerate assets and `data/character/profession-presets.json` from the 13 supplied fillable PDFs:

```sh
python3 scripts/prepare-reference-templates.py DIRECTORY_WITH_PDFS
```

Python dependencies: PyMuPDF, Pillow, fonttools with Brotli support. Source PDFs are not shipped. The generator removes all sample-filled widgets and clears the six fixed story prompts before rendering artwork. Do not rasterize filled samples into the backgrounds.
