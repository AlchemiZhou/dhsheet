/** Original A4 form coordinates. All print pages share one zero-margin A4 paper box. */
export const REFERENCE_PAGE_WIDTH = 595.2756;
export const REFERENCE_PAGE_HEIGHT = 841.8898;

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
