import { describe, expect, it } from "vitest";
import { getColor } from "../../content/packs";
import { pickShapeFillColors } from "./shape-fill-colors";

describe("shape fill colors", () => {
  it("keeps primary as scene foreground, distinct companions, deterministic", () => {
    const { background, foreground } = getColor("red");
    const first = pickShapeFillColors({
      sceneId: "0-red-circle",
      backgroundHex: background,
      primaryForeground: foreground,
      count: 3,
    });
    const again = pickShapeFillColors({
      sceneId: "0-red-circle",
      backgroundHex: background,
      primaryForeground: foreground,
      count: 3,
    });

    expect(first[0]).toBe(foreground);
    expect(new Set(first).size).toBe(3);
    expect(first.every((fill) => fill.toLowerCase() !== background.toLowerCase())).toBe(
      true,
    );
    expect(first).toEqual(again);
  });
});
