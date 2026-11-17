"""Prepare lossless screen-resolution copies; print assets remain unchanged.
Usage: python scripts/prepare-screen-reference-templates.py
Requires Pillow. Coordinates and physical page size are unchanged.
"""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/print-templates'
CATALOG = json.loads((ROOT / 'data/character/profession-presets.json').read_text())
DEST = ASSETS / 'screen'
DEST.mkdir(exist_ok=True)
for profession in CATALOG:
    for page in (1, 2):
        source = ASSETS / f'{profession}-{page}.webp'
        with Image.open(source) as image:
            image.resize((1600, round(image.height * 1600 / image.width)), Image.Resampling.LANCZOS).save(DEST / source.name, lossless=True, method=6)
print(f'Prepared {len(CATALOG) * 2} screen backgrounds at 1600 px width.')
