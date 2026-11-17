import type { ReferenceFieldBox } from "./model";

/** Keep native labels; shorten only the right ends of the second-row fields. */
export const PAPER_IDENTITY_CONTROLS = {
  community: { right: 309.29, control: [312.29, 26.848, 356.046, 44.361] },
  subclass: { right: 472.128, control: [475.128, 26.848, 518.885, 44.361] },
} as const;

export function compactIdentityField(
  name: string,
  field: ReferenceFieldBox,
): ReferenceFieldBox {
  const layout =
    PAPER_IDENTITY_CONTROLS[name as keyof typeof PAPER_IDENTITY_CONTROLS];
  return layout
    ? {
        ...field,
        rect: [field.rect[0], field.rect[1], layout.right - 2.5, field.rect[3]],
      }
    : field;
}
