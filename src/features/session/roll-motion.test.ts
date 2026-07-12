import { describe, expect, it } from "vitest";
import type { RollActor } from "./roll";
import { ENTRY_DURATION_MS, sampleActorPose, sampleRollDistance } from "./roll-motion";

const primary: RollActor = {
  key: "scene-primary",
  role: "primary",
  direction: "left",
  delayMs: 0,
  scale: 1,
};

describe("roll motion", () => {
  it("keeps actors off-stage before their delay, then eases toward settle while spinning", () => {
    const before = sampleActorPose(primary, 0, 400);
    expect(before.x).toBeLessThan(-0.8);
    expect(before.opacity).toBeLessThan(1);

    const mid = sampleActorPose(primary, ENTRY_DURATION_MS * 0.5, 400);
    expect(mid.x).toBeGreaterThan(before.x);
    expect(mid.x).toBeLessThan(0);
    expect(Math.abs(mid.rotationRad)).toBeGreaterThan(Math.abs(before.rotationRad));

    const settled = sampleActorPose(primary, ENTRY_DURATION_MS, 400);
    expect(settled.x).toBeCloseTo(0, 2);
    expect(settled.y).toBeCloseTo(0, 2);
    expect(settled.opacity).toBe(1);
    expect(Math.abs(settled.rotationRad)).toBeGreaterThan(Math.PI);
  });

  it("keeps rolling after entry instead of freezing", () => {
    const justSettled = sampleActorPose(primary, ENTRY_DURATION_MS, 400);
    const later = sampleActorPose(primary, ENTRY_DURATION_MS + 1_400, 400);

    expect(Math.abs(later.rotationRad)).toBeGreaterThan(
      Math.abs(justSettled.rotationRad),
    );
    expect(Math.hypot(later.x, later.y)).toBeGreaterThan(0.02);
  });

  it("ties spin amount to traveled distance for a rolling feel", () => {
    const early = sampleRollDistance(primary, 200, 400);
    const late = sampleRollDistance(primary, 900, 400);
    expect(late).toBeGreaterThan(early);
  });

  it("respects staggered companion delays", () => {
    const companion: RollActor = {
      ...primary,
      key: "scene-a",
      role: "companion",
      direction: "top-right",
      delayMs: 300,
      scale: 0.5,
    };

    const duringDelay = sampleActorPose(companion, 100, 400);
    const afterDelay = sampleActorPose(companion, 500, 400);
    expect(duringDelay.x).toBeCloseTo(sampleActorPose(companion, 0, 400).x, 5);
    expect(afterDelay.x).not.toBeCloseTo(duringDelay.x, 1);
  });
});
