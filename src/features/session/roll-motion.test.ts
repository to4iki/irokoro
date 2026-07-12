import { describe, expect, it } from "vitest";
import type { RollActor } from "./roll";
import { ENTRY_DURATION_MS, sampleActorPose } from "./roll-motion";

const primary: RollActor = {
  key: "scene-primary",
  role: "primary",
  direction: "left",
  delayMs: 0,
  scale: 1,
};

describe("roll motion", () => {
  it("rolls in from off-stage with spin, then keeps moving after settle", () => {
    const start = sampleActorPose(primary, 0, 400);
    const mid = sampleActorPose(primary, ENTRY_DURATION_MS * 0.5, 400);
    const settled = sampleActorPose(primary, ENTRY_DURATION_MS, 400);
    const later = sampleActorPose(primary, ENTRY_DURATION_MS + 1_400, 400);

    expect(start.x).toBeLessThan(-0.8);
    expect(mid.x).toBeGreaterThan(start.x);
    expect(settled.x).toBeCloseTo(0, 2);
    expect(Math.abs(settled.rotationRad)).toBeGreaterThan(Math.PI);
    expect(Math.abs(later.rotationRad)).toBeGreaterThan(Math.abs(settled.rotationRad));
    expect(Math.hypot(later.x, later.y)).toBeGreaterThan(0.02);
  });
});
