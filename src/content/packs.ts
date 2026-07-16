import { ANIMALS, type AnimalId } from "./animals";

/** High-contrast primary pairs inspired by Sassy baby-book pages. */
export const COLORS = [
  {
    id: "red",
    label: "あか",
    background: "#e60012",
    foreground: "#ffe500",
  },
  {
    id: "blue",
    label: "あお",
    background: "#0057ff",
    foreground: "#ffe500",
  },
  {
    id: "yellow",
    label: "きいろ",
    background: "#ffe500",
    foreground: "#111111",
  },
  {
    id: "green",
    label: "みどり",
    background: "#00b82e",
    foreground: "#111111",
  },
  {
    id: "orange",
    label: "だいだい",
    background: "#ff6a00",
    foreground: "#111111",
  },
  {
    id: "cyan",
    label: "みずいろ",
    background: "#00c4f0",
    foreground: "#111111",
  },
  {
    id: "magenta",
    label: "ピンク",
    background: "#ff0090",
    foreground: "#ffffff",
  },
  {
    id: "purple",
    label: "むらさき",
    background: "#6a00ff",
    foreground: "#ffe500",
  },
  {
    id: "black",
    label: "くろ",
    background: "#111111",
    foreground: "#ffe500",
  },
  {
    id: "white",
    label: "しろ",
    background: "#ffffff",
    foreground: "#e60012",
  },
  {
    id: "lime",
    label: "きみどり",
    background: "#b4e600",
    foreground: "#111111",
  },
  {
    id: "sky",
    label: "そらいろ",
    background: "#00a8ff",
    foreground: "#111111",
  },
] as const;

/** Visual variety within the colors pack. */
export const SHAPES = [
  { id: "circle", label: "まる" },
  { id: "triangle", label: "さんかく" },
  { id: "square", label: "しかく" },
  { id: "star", label: "おほしさま" },
] as const;

export type ColorId = (typeof COLORS)[number]["id"];
export type ShapeId = (typeof SHAPES)[number]["id"];
export type PackId = "colors" | "animals";

export type ContentPack = {
  id: PackId;
  shortLabel: string;
  title: string;
  description: string;
};

export type PackChoice = {
  id: PackId;
  shortLabel: string;
  detail: string;
};

const colorById = new Map(COLORS.map((color) => [color.id, color]));
const shapeById = new Map(SHAPES.map((shape) => [shape.id, shape]));

export const CONTENT_PACKS: Record<PackId, ContentPack> = {
  colors: {
    id: "colors",
    shortLabel: "いろ",
    title: "いろを みつけよう",
    description: "背景の色を、ゆっくり声に出してみましょう。",
  },
  animals: {
    id: "animals",
    shortLabel: "どうぶつ",
    title: "どうぶつを みつけよう",
    description: "どうぶつのなまえを、ゆっくり声に出してみましょう。",
  },
};

/** Setup choices: colors and animals are both playable. */
export const PACK_CHOICES: readonly PackChoice[] = [
  {
    id: "colors",
    shortLabel: "いろ",
    detail: `${COLORS.length}つの色`,
  },
  {
    id: "animals",
    shortLabel: "どうぶつ",
    detail: `${ANIMALS.length}つのどうぶつ`,
  },
];

export function getColor(id: ColorId) {
  const color = colorById.get(id);
  if (!color) {
    throw new RangeError(`Unknown color: ${id}`);
  }
  return color;
}

export function getShape(id: ShapeId) {
  const shape = shapeById.get(id);
  if (!shape) {
    throw new RangeError(`Unknown shape: ${id}`);
  }
  return shape;
}

export type { AnimalId };
