export const COLORS = [
  {
    id: "blue",
    label: "あお",
    background: "#1769e0",
    foreground: "#fff1a8",
  },
  {
    id: "yellow",
    label: "きいろ",
    background: "#f4cf3a",
    foreground: "#173451",
  },
  {
    id: "green",
    label: "みどり",
    background: "#2b9a66",
    foreground: "#fff0bd",
  },
  {
    id: "purple",
    label: "むらさき",
    background: "#7054bd",
    foreground: "#ffd865",
  },
  {
    id: "orange",
    label: "だいだい",
    background: "#ed7847",
    foreground: "#173451",
  },
  {
    id: "aqua",
    label: "みずいろ",
    background: "#48acd1",
    foreground: "#fff4ce",
  },
  {
    id: "pink",
    label: "ももいろ",
    background: "#ce6690",
    foreground: "#ffe47a",
  },
  {
    id: "navy",
    label: "こんいろ",
    background: "#294260",
    foreground: "#f5cb54",
  },
] as const;

export const SHAPES = [
  { id: "circle", label: "まる" },
  { id: "triangle", label: "さんかく" },
  { id: "square", label: "しかく" },
  { id: "star", label: "おほしさま" },
] as const;

export type ColorId = (typeof COLORS)[number]["id"];
export type ShapeId = (typeof SHAPES)[number]["id"];
export type PackId = "colors" | "shapes";

type SceneContent = {
  colorId: ColorId;
  shapeId: ShapeId;
};

export type ContentPack = {
  id: PackId;
  shortLabel: string;
  title: string;
  description: string;
  cue: (scene: SceneContent) => string;
};

const colorById = new Map(COLORS.map((color) => [color.id, color]));
const shapeById = new Map(SHAPES.map((shape) => [shape.id, shape]));

export const CONTENT_PACKS: Record<PackId, ContentPack> = {
  colors: {
    id: "colors",
    shortLabel: "いろ",
    title: "いろを みつけよう",
    description: "背景の色を、ゆっくり声に出してみましょう。",
    cue: (scene) => `${getColor(scene.colorId).label}、みつけた`,
  },
  shapes: {
    id: "shapes",
    shortLabel: "かたち",
    title: "かたちを みつけよう",
    description: "まんなかの形を、指さしてみましょう。",
    cue: (scene) => `${getShape(scene.shapeId).label}、みつけた`,
  },
};

export const FINISH_SUGGESTIONS = [
  "同じ色を、お部屋の中で探してみよう。",
  "見つけた形を、指で空に描いてみよう。",
  "好きだった色を、ことばで教えてね。",
  "まるいものを、いっしょに一つ探してみよう。",
] as const;

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
