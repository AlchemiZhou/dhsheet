import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ReferenceSheet } from '@/components/print/reference-sheet';
import { defaultSheetData } from '@/lib/default-sheet-data';
import { PROFESSION_PRESETS } from '@/character/profession-setup/catalog';
import type { ProfessionThemeId } from '@/character/appearance/theme';
import { REFERENCE_CHARACTER_PORTRAIT } from '@/character/print-reference/layout';

const image = 'data:image/png;base64,portrait';
function page(id: ProfessionThemeId, page: 1 | 2, portrait?: string) {
  const html = renderToStaticMarkup(<ReferenceSheet sheet={{ ...structuredClone(defaultSheetData), characterImage: portrait }} id={id} page={page} onOverflow={vi.fn()} />);
  const document = new DOMParser().parseFromString(html, 'text/html');
  return document;
}
describe('reference portrait placement', () => {
  it.each(Object.keys(PROFESSION_PRESETS) as ProfessionThemeId[])('places one square portrait on the back of %s', id => {
    const back = page(id, 2, image);
    const portrait = back.querySelector<HTMLDivElement>('.reference-character-portrait')!;
    expect(portrait.querySelector('img')?.getAttribute('src')).toBe(image);
    expect(portrait.style.width).toBe('45mm');
    expect(portrait.style.height).toBe('45mm');
    expect(back.querySelectorAll('.reference-character-portrait')).toHaveLength(1);
    expect(page(id, 1, image).querySelector('.reference-character-portrait')).toBeNull();
  });
  it('keeps the original recommendation guide when no portrait is uploaded', () => {
    const back = page('warrior', 2);
    expect(back.querySelector('.reference-background')?.getAttribute('src')).toContain('warrior-2.webp');
    expect(back.querySelector('.reference-portrait-mask')).toBeNull();
    expect(back.querySelector('.reference-portrait-notes')).toBeNull();
  });
  it('fits the square inside the recommendation column without covering the divider or the story sections', () => {
    const { mask, left, top, sizeMM } = REFERENCE_CHARACTER_PORTRAIT;
    const size = sizeMM * 72 / 25.4;
    expect(mask[0]).toBeGreaterThan(20);
    expect(mask[2]).toBeLessThan(217);
    expect(left).toBeGreaterThan(mask[0]);
    expect(left + size).toBeLessThan(mask[2]);
    expect(top).toBeGreaterThan(mask[1]);
    expect(top + size).toBeLessThan(mask[3]);
    expect(mask[3]).toBeLessThan(216);
  });
});
