import { describe, expect, it } from "vitest";
import { CONTENT_PACKS, type ColorId, getColor, getShape, type ShapeId } from "./packs";

describe("content packs", () => {
  it("turns the same scene into mode-specific parent cues", () => {
    const scene = { colorId: "blue", shapeId: "circle" } as const;

    expect(CONTENT_PACKS.colors.cue(scene)).toBe("あお、みつけた");
    expect(CONTENT_PACKS.shapes.cue(scene)).toBe("まる、みつけた");
  });

  it("rejects unknown content ids", () => {
    expect(() => getColor("missing" as ColorId)).toThrow(RangeError);
    expect(() => getShape("missing" as ShapeId)).toThrow(RangeError);
  });
});
