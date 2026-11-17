import { describe, expect, it } from "vitest";
import { PROFESSION_PRESETS } from "@/character/profession-setup/catalog";
import {
  compactIdentityField,
  PAPER_IDENTITY_CONTROLS,
} from "../identity-controls";
import metadata from "@/data/character/paper-attribute-headings.json";

describe("native identity control geometry", () => {
  it("shortens only the second-row values and keeps controls inside all thirteen native headers", () => {
    for (const [id, preset] of Object.entries(PROFESSION_PRESETS)) {
      const palette = metadata.identity[id as keyof typeof metadata.identity];
      expect(palette.background).toMatch(/^#[0-9a-f]{6}$/);
      expect(palette.border).toMatch(/^#[0-9a-f]{6}$/);
      for (const name of ["community", "subclass"] as const) {
        const field = preset.pages[0].fields[name];
        const original = [...field.rect];
        const compact = compactIdentityField(name, field);
        expect(compact.rect[0]).toBe(field.rect[0]);
        expect(compact.rect[1]).toBe(field.rect[1]);
        expect(compact.rect[3]).toBe(field.rect[3]);
        expect(compact.rect[2]).toBeLessThan(
          PAPER_IDENTITY_CONTROLS[name].control[0],
        );
        expect(PAPER_IDENTITY_CONTROLS[name].control[2]).toBeLessThan(
          field.rect[2] + 4,
        );
        expect(field.rect).toEqual(original);
      }
      expect(compactIdentityField("name", preset.pages[0].fields.name)).toBe(
        preset.pages[0].fields.name,
      );
    }
  });
});
