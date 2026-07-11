import { COLORS, type ColorId, SHAPES, type ShapeId } from "../../content/packs";

export type Scene = {
  id: string;
  colorId: ColorId;
  shapeId: ShapeId;
  durationMs: number;
};

type SequenceOptions = {
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
  length,
  random = Math.random,
}: SequenceOptions): Scene[] {
  if (!Number.isInteger(length) || length <= 0) {
    throw new RangeError("Sequence length must be a positive integer.");
  }

  const scenes: Scene[] = [];
  let colorIndex = randomIndex(COLORS.length, random);
  let shapeIndex = randomIndex(SHAPES.length, random);

  for (let index = 0; index < length; index += 1) {
    if (index > 0) {
      colorIndex = differentIndex(colorIndex, COLORS.length, random);
      shapeIndex = differentIndex(shapeIndex, SHAPES.length, random);
    }

    const color = COLORS[colorIndex];
    const shape = SHAPES[shapeIndex];
    if (!color || !shape) {
      throw new RangeError("Unable to create a scene from the content pack.");
    }

    scenes.push({
      id: `${index}-${color.id}-${shape.id}`,
      colorId: color.id,
      shapeId: shape.id,
      durationMs: 4_000 + Math.floor(random() * 2_001),
    });
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
