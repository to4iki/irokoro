import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createSceneSequence, createSeededRandom, SCENE_DURATION_MS } from "./sequence";

describe("createSceneSequence", () => {
  it("keeps calm dwell times and avoids adjacent color/shape repeats for any seed", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer({ min: 2, max: 64 }), (seed, length) => {
        const scenes = createSceneSequence({
          length,
          random: createSeededRandom(seed),
        });

        return scenes.every((scene, index) => {
          const previous = scenes[index - 1];
          return (
            scene.durationMs >= SCENE_DURATION_MS.min &&
            scene.durationMs <= SCENE_DURATION_MS.max &&
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
