import { describe, expect, it } from "vitest";
import {
  canStartPon,
  cssPointToPose,
  PON_PEAK_SCALE,
  PON_RATE_LIMIT_MS,
  PON_TOTAL_MS,
  pickPonActorIndex,
  ponScaleFactor,
} from "./touch-pon";

describe("touch pon", () => {
  it("scales up then returns to 1 within the calm duration window", () => {
    expect(ponScaleFactor(-1)).toBe(1);
    expect(ponScaleFactor(0)).toBe(1);
    expect(ponScaleFactor(PON_TOTAL_MS)).toBe(1);
    expect(ponScaleFactor(PON_TOTAL_MS + 50)).toBe(1);

    const midRise = ponScaleFactor(50);
    const peak = ponScaleFactor(100);
    const midFall = ponScaleFactor(220);

    expect(midRise).toBeGreaterThan(1);
    expect(midRise).toBeLessThan(peak);
    expect(peak).toBeGreaterThanOrEqual(1.3);
    expect(peak).toBeLessThanOrEqual(1.4);
    expect(peak).toBeCloseTo(PON_PEAK_SCALE, 5);
    expect(midFall).toBeLessThan(peak);
    expect(midFall).toBeGreaterThan(1);
  });

  it("picks the nearest actor, falling back to primary when far away", () => {
    const poses = [
      { x: 0, y: 0 },
      { x: -0.4, y: 0.2 },
      { x: 0.5, y: -0.3 },
    ];

    expect(pickPonActorIndex(poses, -0.38, 0.18)).toBe(1);
    expect(pickPonActorIndex(poses, 0.48, -0.28)).toBe(2);
    expect(pickPonActorIndex(poses, 0.9, 0.9)).toBe(0);
  });

  it("maps CSS pointer coordinates into pose space", () => {
    expect(cssPointToPose(200, 100, 400, 200)).toEqual({ x: 0, y: 0 });
    expect(cssPointToPose(400, 0, 400, 200)).toEqual({ x: 1, y: -1 });
    expect(cssPointToPose(0, 200, 400, 200)).toEqual({ x: -1, y: 1 });
  });

  it("enforces completion ignore and the 250ms global rate limit", () => {
    expect(
      canStartPon({
        nowMs: 1_000,
        lastStartMs: null,
        reactionElapsedMs: null,
      }),
    ).toBe(true);

    expect(
      canStartPon({
        nowMs: 1_000,
        lastStartMs: 900,
        reactionElapsedMs: null,
      }),
    ).toBe(false);

    expect(
      canStartPon({
        nowMs: 1_000,
        lastStartMs: 1_000 - PON_RATE_LIMIT_MS,
        reactionElapsedMs: null,
      }),
    ).toBe(true);

    expect(
      canStartPon({
        nowMs: 1_000,
        lastStartMs: 700,
        reactionElapsedMs: 100,
      }),
    ).toBe(false);

    expect(
      canStartPon({
        nowMs: 1_000,
        lastStartMs: 700,
        reactionElapsedMs: PON_TOTAL_MS,
      }),
    ).toBe(true);
  });
});
