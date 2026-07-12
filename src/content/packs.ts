export const COLORS = [
  {
    id: "blue",
    label: "あお",
    background: "#0066ff",
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
    background: "#00c43a",
    foreground: "#111111",
  },
  {
    id: "purple",
    label: "むらさき",
    background: "#6b2fff",
    foreground: "#ffe500",
  },
  {
    id: "orange",
    label: "だいだい",
    background: "#ff5a00",
    foreground: "#111111",
  },
  {
    id: "aqua",
    label: "みずいろ",
    background: "#00c2e8",
    foreground: "#111111",
  },
  {
    id: "pink",
    label: "ももいろ",
    background: "#ff2d7a",
    foreground: "#ffffff",
  },
  {
    id: "navy",
    label: "こんいろ",
    background: "#0b1230",
    foreground: "#ffe500",
  },
] as const;

/** Visual variety within the colors pack. Animals pack will replace this later. */
export const SHAPES = [
  { id: "circle", label: "まる" },
  { id: "triangle", label: "さんかく" },
  { id: "square", label: "しかく" },
  { id: "star", label: "おほしさま" },
] as const;

export type ColorId = (typeof COLORS)[number]["id"];
export type ShapeId = (typeof SHAPES)[number]["id"];
export type PackId = "colors";

export type ContentPack = {
  id: PackId;
  shortLabel: string;
  title: string;
  description: string;
};

export type PackChoice =
  | {
      id: PackId;
      shortLabel: string;
      detail: string;
      available: true;
    }
  | {
      id: "animals";
      shortLabel: string;
      detail: string;
      available: false;
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
};

/** Setup choices: only colors is playable; animals is a reserved slot. */
export const PACK_CHOICES: readonly PackChoice[] = [
  {
    id: "colors",
    shortLabel: "いろ",
    detail: "8つの色",
    available: true,
  },
  {
    id: "animals",
    shortLabel: "どうぶつ",
    detail: "もうすぐ",
    available: false,
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
