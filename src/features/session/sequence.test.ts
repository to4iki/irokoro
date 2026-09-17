import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { PackId } from "../../content/packs";
import { createSceneSequence, SCENE_DURATION_MS } from "./sequence";

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

describe("createSceneSequence", () => {
  it("keeps calm dwell times and avoids adjacent color/subject repeats for any seed", () => {
    fc.assert(
      fc.property(
        fc.constantFrom<PackId>("colors", "animals"),
        fc.integer(),
        fc.integer({ min: 2, max: 64 }),
        (packId, seed, length) => {
          const scenes = createSceneSequence({
            packId,
            length,
            random: createSeededRandom(seed),
          });

          return scenes.every((scene, index) => {
            if (
              scene.packId !== packId ||
              scene.durationMs < SCENE_DURATION_MS.min ||
              scene.durationMs > SCENE_DURATION_MS.max
            ) {
              return false;
            }

            const previous = scenes[index - 1];
            if (!previous) {
              return true;
            }
            if (scene.colorId === previous.colorId) {
              return false;
            }
            if (scene.packId === "colors" && previous.packId === "colors") {
              return scene.shapeId !== previous.shapeId;
            }
            if (scene.packId === "animals" && previous.packId === "animals") {
              return scene.animalId !== previous.animalId;
            }
            return false;
          });
        },
      ),
    );
  });

  it("rejects non-positive or fractional sequence lengths", () => {
    expect(() => createSceneSequence({ packId: "colors", length: 0 })).toThrow(
      RangeError,
    );
    expect(() => createSceneSequence({ packId: "colors", length: 2.5 })).toThrow(
      RangeError,
    );
  });
});
