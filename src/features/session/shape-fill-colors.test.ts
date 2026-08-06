import { describe, expect, it } from "vitest";
import { COLORS } from "../../content/packs";
import { pickShapeFillColors } from "./shape-fill-colors";

describe("shape fill colors", () => {
  it("gives each actor a distinct fill, keeping primary as the scene foreground", () => {
    const background = COLORS[0]?.background;
    const foreground = COLORS[0]?.foreground;
    if (!background || !foreground) {
      throw new Error("expected color swatches");
    }

    const colors = pickShapeFillColors({
      sceneId: "0-red-circle",
      backgroundHex: background,
      primaryForeground: foreground,
      count: 3,
    });

    expect(colors).toHaveLength(3);
    expect(colors[0]).toBe(foreground);
    expect(new Set(colors).size).toBe(3);
    for (const fill of colors) {
      expect(fill.toLowerCase()).not.toBe(background.toLowerCase());
    }
  });

  it("is deterministic for the same scene and varies across scenes", () => {
    const background = "#0057ff";
    const foreground = "#ffe500";
    const a = pickShapeFillColors({
      sceneId: "1-blue-star",
      backgroundHex: background,
      primaryForeground: foreground,
      count: 3,
    });
    const b = pickShapeFillColors({
      sceneId: "1-blue-star",
      backgroundHex: background,
      primaryForeground: foreground,
      count: 3,
    });
    const c = pickShapeFillColors({
      sceneId: "7-blue-square",
      backgroundHex: background,
      primaryForeground: foreground,
      count: 3,
    });

    expect(a).toEqual(b);
    expect(a.slice(1).join(",")).not.toBe(c.slice(1).join(","));
  });
});
