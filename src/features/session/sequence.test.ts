import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { createSceneSequence, createSeededRandom, SCENE_DURATION_MS } from "./sequence";

describe("createSceneSequence", () => {
  it("keeps calm dwell times and avoids adjacent color/shape repeats for any seed", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer({ min: 2, max: 64 }), (seed, length) => {
        const scenes = createSceneSequence({
          packId: "colors",
          length,
          random: createSeededRandom(seed),
        });

        return scenes.every((scene, index) => {
          const previous = scenes[index - 1];
          return (
            scene.packId === "colors" &&
            scene.durationMs >= SCENE_DURATION_MS.min &&
            scene.durationMs <= SCENE_DURATION_MS.max &&
            (previous?.packId !== "colors" ||
              (scene.colorId !== previous.colorId &&
                scene.shapeId !== previous.shapeId))
          );
        });
      }),
    );
  });

  it("keeps calm dwell times and avoids adjacent color/animal repeats for animals pack", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer({ min: 2, max: 64 }), (seed, length) => {
        const scenes = createSceneSequence({
          packId: "animals",
          length,
          random: createSeededRandom(seed),
        });

        return scenes.every((scene, index) => {
          const previous = scenes[index - 1];
          return (
            scene.packId === "animals" &&
            scene.durationMs >= SCENE_DURATION_MS.min &&
            scene.durationMs <= SCENE_DURATION_MS.max &&
            (previous?.packId !== "animals" ||
              (scene.colorId !== previous.colorId &&
                scene.animalId !== previous.animalId))
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
