"""Render the companion (third) page of the supplied Ranger print PDF.
Usage: python3 scripts/prepare-companion-template.py SOURCE.pdf
Dependencies: PyMuPDF and Pillow. The source PDF is not shipped.
"""
from pathlib import Path
import sys
import fitz
from PIL import Image

source = fitz.open(sys.argv[1])
if len(source) < 3:
    raise ValueError('Expected the Ranger print PDF with its companion page')
page = source[2]
# Replace the original wide portrait outline with a 96.3 pt square.
# The remaining space holds the existing editable companion description.
page.draw_rect(fitz.Rect(53, 117, 542, 217), color=None, fill=(1, 1, 1))
page.draw_rect(fitz.Rect(54.58, 118.68, 150.88, 214.98), color=(.49, .54, .47), width=.65)
pixmap = page.get_pixmap(dpi=400, alpha=False)
target = Path(__file__).resolve().parents[1] / 'public/print-templates/ranger-companion.webp'
Image.frombytes('RGB', [pixmap.width, pixmap.height], pixmap.samples).save(target, lossless=True, method=6)
