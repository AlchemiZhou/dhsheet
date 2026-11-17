"""Extract original glyphs for subclass spellcasting marks without redrawing them.

Usage: python scripts/extract-paper-attribute-headings.py DIRECTORY_WITH_PRINT_PDFS
Requires PyMuPDF and Pillow. Source PDFs are read only.
"""
from collections import Counter
from pathlib import Path
import json
import sys

import fitz
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(sys.argv[1])
PRESETS = json.loads((ROOT / 'data/character/profession-presets.json').read_text())
OUTPUT = ROOT / 'public/print-templates/attribute-headings'
OUTPUT.mkdir(exist_ok=True)
ATTRIBUTES = ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge']
warrior = fitz.open(SOURCE / '战士角色卡_打印版.pdf')
fields = PRESETS['warrior']['pages'][0]['fields']
font_xref = next(font[0] for font in warrior[0].get_fonts() if 'SheetSansBold' in font[3])
(ROOT / 'public/print-templates/form-label-bold.ttf').write_bytes(warrior.extract_font(font_xref)[3])
# In-memory mask removes the fixed caption from the neutral heading source.
warrior[0].draw_rect(fitz.Rect(189, 57.5, 581, 66.2), color=None, fill=(1, 1, 1), overlay=True)
metadata = {'headings': {}, 'accents': {}, 'defaults': {}, 'identity': {}}


def color_counts(page, rect, dpi=100):
    pixmap = page.get_pixmap(dpi=dpi, clip=fitz.Rect(rect), alpha=False)
    image = Image.frombytes('RGB', (pixmap.width, pixmap.height), pixmap.samples)
    return image, Counter(image.getdata())


def save(page, rect, filename):
    image, counts = color_counts(page, rect, dpi=400)
    image.save(OUTPUT / filename, lossless=True, method=6)
    return max(((color, n) for color, n in counts.items() if max(color) < 220), key=lambda item: item[1])[0]


for attribute in ATTRIBUTES:
    value = fields[f'total.{attribute}']['rect']
    mark = fields[f'mark.{attribute}']['rect']
    rect = [value[0] - 16, 57.5, mark[2] + 1, 77.55]
    metadata['headings'][attribute] = {
        'rect': rect,
        'background': save(warrior[0], rect, f'{attribute}.webp'),
    }

caption = [529.912, 60.208, 565.123, 67.309]
wizard = fitz.open(SOURCE / '法师角色卡_打印版.pdf')
metadata['caption'] = {
    'rect': caption,
    'offset': caption[0] - fields['total.knowledge']['rect'][0],
    'background': save(wizard[0], caption, 'caption.webp'),
}
for profession, preset in PRESETS.items():
    with fitz.open(SOURCE / f"{preset['name']}角色卡_打印版.pdf") as document:
        pixmap = document[0].get_pixmap(alpha=False)
        border = next(d['fill'] for d in document[0].get_drawings()
                      if 190 < d['rect'].x0 < 191 and 26 < d['rect'].y0 < 27
                      and d['fill'] and d['fill'] != (1., 1., 1.))
        metadata['identity'][profession] = {
            'background': '#%02x%02x%02x' % pixmap.pixel(358, 36),
            'border': '#%02x%02x%02x' % tuple(round(v * 255) for v in border),
        }
        _, counts = color_counts(document[0], [189, 66.8, 581, 75.7])
        colors = [(color, n) for color, n in counts.items()
                  if max(color) - min(color) > 15 and max(color) < 220]
        if colors:
            metadata['accents'][profession] = max(colors, key=lambda item: item[1])[0]
        for attribute, heading in metadata['headings'].items():
            rect = heading['rect']
            _, counts = color_counts(document[0], [rect[0], 67, rect[2], 75.5])
            matches = [n for color, n in counts.items()
                       if max(color) - min(color) > 15 and max(color) < 220]
            if matches and max(matches) > 15:
                metadata['defaults'][profession] = attribute
(ROOT / 'data/character/paper-attribute-headings.json').write_text(json.dumps(metadata, separators=(',', ':')))
print('Prepared six original headings, spellcasting caption and source label font.')
