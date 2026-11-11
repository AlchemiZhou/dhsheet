/** Original A4 form coordinates; ordinary card pages use their own local print scale. */
export const REFERENCE_PAGE_WIDTH = 595.2756;
export const REFERENCE_PAGE_HEIGHT = 841.8898;
export const REFERENCE_CONTENT_SCALE = 200 / 210;

/** Fill the two separate writing rows, honoring explicit paragraph breaks. */
export function splitReferenceFeature(
  text: string,
  widths: readonly number[],
  measure: (value: string) => number,
): { lines: string[]; remaining: string } {
  let remaining = text.replace(/\r\n?/g, "\n");
  const lines = widths.map((width) => {
    const characters = Array.from(remaining);
    let count = 0;
    while (
      count < characters.length &&
      characters[count] !== "\n" &&
      measure(characters.slice(0, count + 1).join("")) <= width
    )
      count++;
    const line = characters.slice(0, count).join("");
    remaining = characters
      .slice(count + (characters[count] === "\n" ? 1 : 0))
      .join("");
    return line;
  });
  return { lines, remaining };
}
