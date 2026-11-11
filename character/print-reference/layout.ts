/** The original form coordinates stay unchanged inside a centered, print-safe A4 canvas. */
export const REFERENCE_PAGE_WIDTH = 595.2756;
export const REFERENCE_PAGE_HEIGHT = 841.8898;
export const REFERENCE_CONTENT_SCALE = 200 / 210;

/** Continue strokes whose outside edges were cropped from the supplied artwork. */
export const REFERENCE_FRAME_EDGES: Record<
  1 | 2,
  Array<[number, number, number]>
> = {
  1: [
    [0.65, 159.02, 267.15],
    [0.65, 269.22, 357.99],
    [0.65, 360.34, 542.74],
    [0.65, 549.8, 591.05],
    [0.65, 607.95, 818.2],
    [3.5, 612.24, 814.38],
    [594.63, 158.56, 366.62],
    [594.63, 368.98, 459.85],
    [594.63, 462.21, 831.78],
  ],
  2: [
    [0.65, 221.97, 521.65],
    [594.63, 221.97, 521.65],
  ],
};

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
