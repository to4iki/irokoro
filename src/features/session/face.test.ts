import { describe, expect, it } from "vitest";
import {
  faceMorphT,
  interpolateFace,
  resolveFaceTimeline,
  sampleFaceExpression,
} from "./face";

describe("face expressions", () => {
  it("starts as smile and morphs to surprise over 700–1100ms after mid-scene", () => {
    const timeline = resolveFaceTimeline("0-blue-circle", 7_000);
    expect(timeline.morphStartMs).toBeGreaterThanOrEqual(7_000 * 0.4);
    expect(timeline.morphStartMs).toBeLessThanOrEqual(7_000 * 0.6);
    expect(timeline.morphDurationMs).toBeGreaterThanOrEqual(700);
    expect(timeline.morphDurationMs).toBeLessThanOrEqual(1_100);

    expect(faceMorphT(0, timeline)).toBe(0);
    expect(faceMorphT(timeline.morphStartMs, timeline)).toBe(0);
    expect(faceMorphT(timeline.morphStartMs + timeline.morphDurationMs, timeline)).toBe(
      1,
    );

    const mid = faceMorphT(
      timeline.morphStartMs + timeline.morphDurationMs * 0.5,
      timeline,
    );
    expect(mid).toBeGreaterThan(0.2);
    expect(mid).toBeLessThan(0.8);
  });

  it("interpolates eye size and mouth shape between smile and surprise", () => {
    const smile = interpolateFace(0);
    const surprise = interpolateFace(1);
    const mid = interpolateFace(0.5);

    expect(surprise.eyeRadius).toBeGreaterThan(smile.eyeRadius);
    expect(mid.eyeRadius).toBeGreaterThan(smile.eyeRadius);
    expect(mid.eyeRadius).toBeLessThan(surprise.eyeRadius);
    expect(smile.mouthOpen).toBeLessThan(surprise.mouthOpen);
  });

  it("keeps early scene on smile for any seed-like scene id", () => {
    for (const id of ["0-red-star", "3-green-triangle", "12-yellow-square"]) {
      const face = sampleFaceExpression(id, 500, 7_000);
      expect(face.mouthOpen).toBeLessThan(0.15);
    }
  });
});
