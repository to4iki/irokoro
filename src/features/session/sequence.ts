import { ANIMALS, type AnimalId } from "../../content/animals";
import {
  COLORS,
  type ColorId,
  type PackId,
  SHAPES,
  type ShapeId,
} from "../../content/packs";

type SceneBase = {
  id: string;
  colorId: ColorId;
  durationMs: number;
};

export type ColorsScene = SceneBase & {
  packId: "colors";
  shapeId: ShapeId;
};

export type AnimalsScene = SceneBase & {
  packId: "animals";
  animalId: AnimalId;
};

export type Scene = ColorsScene | AnimalsScene;

/** Calm scene dwell time for infants: longer holds, slower color changes. */
export const SCENE_DURATION_MS = {
  min: 6_000,
  max: 8_000,
} as const;

type SequenceOptions = {
  packId?: PackId;
  length: number;
  /** Must return values in [0, 1), like Math.random. */
  random?: () => number;
};

function randomIndex(size: number, random: () => number): number {
  return Math.floor(random() * size);
}

function differentIndex(previous: number, size: number, random: () => number): number {
  const offset = 1 + Math.floor(random() * (size - 1));
  return (previous + offset) % size;
}

export function createSceneSequence({
  packId = "colors",
  length,
  random = Math.random,
}: SequenceOptions): Scene[] {
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError("Sequence length must be a positive integer.");
  }

  const subjects = packId === "animals" ? ANIMALS : SHAPES;
  const scenes: Scene[] = [];
  let colorIndex = randomIndex(COLORS.length, random);
  let subjectIndex = randomIndex(subjects.length, random);

  for (let index = 0; index < length; index += 1) {
    if (index > 0) {
      colorIndex = differentIndex(colorIndex, COLORS.length, random);
      subjectIndex = differentIndex(subjectIndex, subjects.length, random);
    }

    const color = COLORS[colorIndex];
    const subject = subjects[subjectIndex];
    if (!color || !subject) {
      throw new RangeError("Unable to create a scene from the content pack.");
    }

    const durationMs =
      SCENE_DURATION_MS.min +
      Math.floor(random() * (SCENE_DURATION_MS.max - SCENE_DURATION_MS.min + 1));

    scenes.push(
      packId === "animals"
        ? {
            id: `${index}-${color.id}-${subject.id}`,
            packId: "animals",
            colorId: color.id,
            animalId: subject.id as AnimalId,
            durationMs,
          }
        : {
            id: `${index}-${color.id}-${subject.id}`,
            packId: "colors",
            colorId: color.id,
            shapeId: subject.id as ShapeId,
            durationMs,
          },
    );
  }

  return scenes;
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
