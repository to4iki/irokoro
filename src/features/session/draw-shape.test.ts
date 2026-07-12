import { describe, expect, it, vi } from "vitest";
import { drawShapePath, paintRollFrame } from "./draw-shape";

function createFakeContext() {
  return {
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    fill: vi.fn(),
    fillStyle: "",
    globalAlpha: 1,
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetY: 0,
  };
}

describe("paintRollFrame", () => {
  it("clears the canvas and draws each actor with rotation", () => {
    const ctx = createFakeContext();
    paintRollFrame(ctx as unknown as CanvasRenderingContext2D, {
      width: 400,
      height: 400,
      shapeId: "square",
      shapeColor: "#ffe500",
      actors: [
        {
          pose: {
            x: 0,
            y: 0,
            rotationRad: 1.2,
            scale: 1,
            opacity: 1,
          },
        },
        {
          pose: {
            x: -0.3,
            y: 0.2,
            rotationRad: -0.8,
            scale: 0.5,
            opacity: 0.9,
          },
        },
      ],
    });

    expect(ctx.clearRect).toHaveBeenCalledOnce();
    expect(ctx.rotate).toHaveBeenCalledTimes(2);
    expect(ctx.fill).toHaveBeenCalledTimes(2);
    expect(ctx.fillStyle).toBe("#ffe500");
  });

  it("supports every playable shape path", () => {
    const ctx = createFakeContext();
    for (const shapeId of ["circle", "triangle", "square", "star"] as const) {
      drawShapePath(ctx as unknown as CanvasRenderingContext2D, shapeId, 100);
    }
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.closePath).toHaveBeenCalled();
  });
});
