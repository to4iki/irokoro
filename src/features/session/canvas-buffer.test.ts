import { describe, expect, it } from "vitest";
import {
  MAX_CANVAS_DEVICE_PIXEL_RATIO,
  resolveCanvasBufferSize,
} from "./canvas-buffer";

describe("resolveCanvasBufferSize", () => {
  it("caps devicePixelRatio and keeps a usable minimum buffer", () => {
    const capped = resolveCanvasBufferSize(1_000, 800, 3);
    expect(capped.ratio).toBe(MAX_CANVAS_DEVICE_PIXEL_RATIO);
    expect(capped.width).toBe(2_000);
    expect(capped.height).toBe(1_600);

    expect(resolveCanvasBufferSize(0, 0, 2)).toEqual({
      width: 1,
      height: 1,
      ratio: 2,
    });
  });
});
