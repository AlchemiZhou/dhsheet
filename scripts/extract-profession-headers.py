"""Extract exact banner pixels from the thirteen user-supplied printable PDFs.
Usage: python scripts/extract-profession-headers.py DIRECTORY_WITH_PRINT_PDFS
Requires PyMuPDF and Pillow. Original PDFs are not bundled with the app.
"""
import hashlib
import json
import sys
from pathlib import Path

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
CATALOG = json.loads((ROOT / 'data/character/profession-presets.json').read_text())
DEST = ROOT / 'public/print-templates/profession-headers'
BOUNDS = (0, 0, 198.323074, 55.553215)
DPI = 400
sources = {}
for profession, preset in CATALOG.items():
    matches = list(SOURCE.rglob(preset['name'] + '角色卡_打印版.pdf'))
    if len(matches) != 1:
        raise ValueError(f'{profession}: expected one printable PDF, found {len(matches)}')
    sources[profession] = matches[0]

DEST.mkdir(parents=True, exist_ok=True)
records = []
for profession, source in sources.items():
    with fitz.open(source) as pdf:
        pix = pdf[0].get_pixmap(dpi=DPI, clip=fitz.Rect(BOUNDS), alpha=False)
        image = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        image.save(DEST / (profession + '.webp'), lossless=True, method=6)
    records.append({
        'id': profession, 'source': source.name,
        'sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'cropPoints': list(BOUNDS), 'bannerPolygonPoints': [[0,0],[198.323074,0],[169.676880,55.553215],[0,55.553215]],
        'dpi': DPI, 'pixels': [pix.width, pix.height],
    })
(DEST / 'sources.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n')
print(f'Extracted {len(records)} original profession banners at {DPI} dpi.')
