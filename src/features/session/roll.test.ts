import { describe, expect, it } from "vitest";
import { createRollCast, ENTRY_DURATION_MS, sampleActorPose } from "./roll";

describe("roll motion", () => {
  it("rolls in from off-stage with spin, then keeps moving after settle", () => {
    const [primary] = createRollCast("0-blue-circle");
    if (!primary) {
      throw new Error("expected a primary actor");
    }

    const start = sampleActorPose(primary, 0);
    const mid = sampleActorPose(primary, ENTRY_DURATION_MS * 0.5);
    const settled = sampleActorPose(primary, ENTRY_DURATION_MS);
    const later = sampleActorPose(primary, ENTRY_DURATION_MS + 1_400);

    expect(Math.hypot(start.x, start.y)).toBeGreaterThan(0.8);
    expect(Math.hypot(mid.x, mid.y)).toBeLessThan(Math.hypot(start.x, start.y));
    expect(settled.x).toBeCloseTo(primary.settleX, 2);
    expect(Math.abs(settled.rotationRad)).toBeGreaterThan(Math.PI);
    expect(Math.abs(later.rotationRad)).toBeGreaterThan(Math.abs(settled.rotationRad));
  });
});
