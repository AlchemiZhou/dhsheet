"""Prepare domain identifier artwork from the user-provided label archive.
Usage: python scripts/prepare-domain-labels.py ARCHIVE.zip
Requires Pillow. No rule text or instructions from the archive are evaluated.
"""
from pathlib import Path
from zipfile import ZipFile
from io import BytesIO
import hashlib
import json
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
archive = Path(sys.argv[1])
output = ROOT / 'public/domain-labels'
output.mkdir(exist_ok=True)
names = {'arcana':'奥术', 'blade':'利刃', 'bone':'骸骨', 'codex':'典籍', 'grace':'优雅', 'midnight':'午夜', 'sage':'贤者', 'splendor':'辉耀', 'valor':'勇气'}
manifest = {'source':archive.name, 'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(), 'assets':{}}
with ZipFile(archive) as source:
    for domain, name in names.items():
        member = f'领域标签/{name}标签.png'
        raw = source.read(member)
        with Image.open(BytesIO(raw)) as image:
            image = image.convert('RGBA')
            resized = image.resize((160, round(image.height*160/image.width)), Image.Resampling.LANCZOS)
            # PNG is supported by Safari 12; retain WebP paths for cached older app chunks.
            resized.save(output/f'{domain}.png', optimize=True)
            resized.save(output/f'{domain}.webp', lossless=True, method=6)
        manifest['assets'][domain] = {'member':member, 'sha256':hashlib.sha256(raw).hexdigest()}
(output/'source.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n')
print('Prepared nine original domain ribbons; Dread/custom domains use the existing icon and domain palette.')
