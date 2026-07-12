import { describe, expect, it } from "vitest";
import { createRollCast, pickRollDirection, ROLL_DIRECTIONS } from "./roll";

describe("roll cast", () => {
  it("picks a known direction from the scene id", () => {
    expect(ROLL_DIRECTIONS).toContain(pickRollDirection("0-blue-circle"));
    expect(pickRollDirection("0-blue-circle")).toBe(pickRollDirection("0-blue-circle"));
    expect(pickRollDirection("0-blue-circle", 1)).not.toBe(
      pickRollDirection("0-blue-circle", 7),
    );
  });

  it("builds one primary and two companion actors with varied directions", () => {
    const cast = createRollCast("3-yellow-star");

    expect(cast).toHaveLength(3);
    expect(cast[0]).toMatchObject({
      role: "primary",
      delayMs: 0,
      scale: 1,
    });
    expect(cast.slice(1).every((actor) => actor.role === "companion")).toBe(true);
    expect(new Set(cast.map((actor) => actor.direction)).size).toBeGreaterThan(1);
    expect(cast.every((actor) => ROLL_DIRECTIONS.includes(actor.direction))).toBe(true);
  });
});
