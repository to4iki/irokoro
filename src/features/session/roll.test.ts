import { describe, expect, it } from "vitest";
import { SUBJECT_BASE_SIZE_RATIO } from "./draw-shape";
import {
  createRollCast,
  ENTRY_DURATION_MS,
  sampleActorPose,
  TILT_MAX_RAD,
} from "./roll";

describe("roll motion", () => {
  it("rolls in from off-stage with spin, then keeps moving after settle", () => {
    const [primary] = createRollCast("0-blue-circle");
    if (!primary) {
      throw new Error("expected a primary actor");
    }

    const start = sampleActorPose(primary, 0);
    const mid = sampleActorPose(primary, ENTRY_DURATION_MS * 0.5);
    const settled = sampleActorPose(primary, ENTRY_DURATION_MS);
    const justAfterEntry = sampleActorPose(primary, ENTRY_DURATION_MS + 1);
    const later = sampleActorPose(primary, ENTRY_DURATION_MS + 1_400);

    expect(Math.hypot(start.x, start.y)).toBeGreaterThan(0.8);
    expect(Math.hypot(mid.x, mid.y)).toBeLessThan(Math.hypot(start.x, start.y));
    expect(settled.x).toBeCloseTo(primary.settleX, 2);
    expect(
      Math.hypot(justAfterEntry.x - settled.x, justAfterEntry.y - settled.y),
    ).toBeLessThan(0.01);
    expect(Math.abs(settled.rotationRad)).toBeGreaterThan(Math.PI);
    expect(Math.abs(later.rotationRad)).toBeGreaterThan(Math.abs(settled.rotationRad));
  });

  it("keeps animal tilt within ±12° without spinning upside down", () => {
    const [primary] = createRollCast("0-red-dog");
    if (!primary) {
      throw new Error("expected a primary actor");
    }

    for (let ms = 0; ms <= 8_000; ms += 250) {
      const pose = sampleActorPose(primary, ms, "tilt");
      expect(Math.abs(pose.rotationRad)).toBeLessThanOrEqual(TILT_MAX_RAD + 1e-9);
    }
  });

  it("uses a calmer entry and slower post-entry travel across a dwell", () => {
    expect(ENTRY_DURATION_MS).toBeGreaterThanOrEqual(1_700);

    const [primary] = createRollCast("0-blue-circle");
    if (!primary) {
      throw new Error("expected a primary actor");
    }

    const atEntry = sampleActorPose(primary, ENTRY_DURATION_MS);
    const shortlyAfter = sampleActorPose(primary, ENTRY_DURATION_MS + 400);
    const travel = Math.hypot(shortlyAfter.x - atEntry.x, shortlyAfter.y - atEntry.y);
    // Slow orbit: ~400ms should not jump a large fraction of the stage.
    expect(travel).toBeLessThan(0.22);
  });

  it("spreads primary and companions so settle centers stay apart", () => {
    const cast = createRollCast("0-blue-circle");
    expect(cast).toHaveLength(3);

    const [primary, companionA, companionB] = cast;
    if (!primary || !companionA || !companionB) {
      throw new Error("expected a 3-actor cast");
    }

    const dist = (a: { settleX: number; settleY: number }, b: typeof a) =>
      Math.hypot(a.settleX - b.settleX, a.settleY - b.settleY);

    expect(dist(primary, companionA)).toBeGreaterThan(0.45);
    expect(dist(primary, companionB)).toBeGreaterThan(0.45);
    expect(dist(companionA, companionB)).toBeGreaterThan(0.7);
  });

  it("keeps subject base size slightly under half the short stage side for phones", () => {
    expect(SUBJECT_BASE_SIZE_RATIO).toBeGreaterThanOrEqual(0.48);
    expect(SUBJECT_BASE_SIZE_RATIO).toBeLessThanOrEqual(0.53);
  });

  it("after entry, primary and companions keep traversing a much larger horizontal and vertical range", () => {
    const cast = createRollCast("0-blue-circle");
    expect(cast.length).toBeGreaterThan(1);

    for (const actor of cast) {
      // Sample across a full dwell so slower periods still show wide travel.
      const samples = Array.from({ length: 40 }, (_, index) =>
        sampleActorPose(actor, ENTRY_DURATION_MS + index * 200),
      );
      const xs = samples.map((pose) => pose.x);
      const ys = samples.map((pose) => pose.y);
      const xRange = Math.max(...xs) - Math.min(...xs);
      const yRange = Math.max(...ys) - Math.min(...ys);
      const minRange = actor.role === "primary" ? 0.5 : 0.28;

      // Legacy tumble radius was ~0.1 (range ≈ 0.2). Post-entry motion must
      // still cross a meaningful portion of the scene during a dwell.
      expect(xRange).toBeGreaterThan(minRange);
      expect(yRange).toBeGreaterThan(minRange);
      expect(Math.max(...xs.map(Math.abs))).toBeLessThan(0.95);
      expect(Math.max(...ys.map(Math.abs))).toBeLessThan(0.95);
    }
  });
});
