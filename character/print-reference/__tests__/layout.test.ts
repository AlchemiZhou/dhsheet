import { describe, expect, it } from "vitest";
import { splitReferenceFeature } from "../layout";

const measure = (value: string) => Array.from(value).length;

describe("native equipment writing rows", () => {
  it("fills the wide first row before the indented second row without losing the remainder", () => {
    const text = "ABCDEFGHIJK";
    const result = splitReferenceFeature(text, [5, 3], measure);
    expect(result.lines).toEqual(["ABCDE", "FGH"]);
    expect(result.remaining).toBe("IJK");
    expect(result.lines.join("") + result.remaining).toBe(text);
  });

  it("honors manual line breaks and retains an additional paragraph for continuation", () => {
    expect(
      splitReferenceFeature("第一行\r\n第二行\n补充段落", [50, 50], measure),
    ).toEqual({ lines: ["第一行", "第二行"], remaining: "补充段落" });
  });

  it("keeps surrogate pairs intact when wrapping", () => {
    expect(splitReferenceFeature("龙😀人", [1, 1], measure)).toEqual({
      lines: ["龙", "😀"],
      remaining: "人",
    });
  });
});
