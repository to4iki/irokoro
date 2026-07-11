import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createSceneSequence, createSeededRandom } from "./sequence";

describe("createSceneSequence", () => {
  it("creates calm six-to-eight-second scenes without adjacent repetition", () => {
    const scenes = createSceneSequence({
      length: 64,
      random: createSeededRandom(42),
    });

    expect(scenes).toHaveLength(64);
    for (const [index, scene] of scenes.entries()) {
      expect(scene.durationMs).toBeGreaterThanOrEqual(6_000);
      expect(scene.durationMs).toBeLessThanOrEqual(8_000);

      const previous = scenes[index - 1];
      if (previous) {
        expect(scene.colorId).not.toBe(previous.colorId);
        expect(scene.shapeId).not.toBe(previous.shapeId);
      }
    }
  });

  it("preserves its safety invariants for arbitrary seeds and session sizes", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer({ min: 2, max: 64 }), (seed, length) => {
        const scenes = createSceneSequence({
          length,
          random: createSeededRandom(seed),
        });

        return scenes.every((scene, index) => {
          const previous = scenes[index - 1];
          return (
            scene.durationMs >= 6_000 &&
            scene.durationMs <= 8_000 &&
            (!previous ||
              (scene.colorId !== previous.colorId &&
                scene.shapeId !== previous.shapeId))
          );
        });
      }),
    );
  });

  it("rejects non-positive or fractional sequence lengths", () => {
    expect(() => createSceneSequence({ length: 0 })).toThrow(RangeError);
    expect(() => createSceneSequence({ length: 2.5 })).toThrow(RangeError);
  });
});
