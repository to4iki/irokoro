import { COLORS } from "../../content/packs";

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase();
}

function parseRgb(hex: string): { r: number; g: number; b: number } | null {
  const value = normalizeHex(hex).replace("#", "");
  if (!/^[0-9a-f]{6}$/.test(value)) {
    return null;
  }
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function channelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const rgb = parseRgb(hex);
  if (!rgb) {
    return 0;
  }
  const r = channelToLinear(rgb.r);
  const g = channelToLinear(rgb.g);
  const b = channelToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors. */
export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const MIN_CONTRAST = 3;

/** Unique high-contrast swatches from the colors pack palette. */
function paletteSwatches(): string[] {
  const seen = new Set<string>();
  const swatches: string[] = [];
  for (const color of COLORS) {
    for (const hex of [color.foreground, color.background]) {
      const key = normalizeHex(hex);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      swatches.push(hex);
    }
  }
  return swatches;
}

function hashScene(sceneId: string, salt: number): number {
  let hash = salt >>> 0;
  for (let index = 0; index < sceneId.length; index += 1) {
    hash = Math.imul(hash ^ sceneId.charCodeAt(index), 0x5bd1e995) >>> 0;
  }
  return hash;
}

/**
 * Per-actor fill colors for the colors pack cast.
 * Primary keeps the scene foreground (語りかけの主色); companions pick other
 * palette swatches that contrast with the background and each other.
 * Assignment is deterministic from sceneId (ランダム風だが毎フレームは変えない).
 */
export function pickShapeFillColors(options: {
  sceneId: string;
  backgroundHex: string;
  primaryForeground: string;
  count: number;
}): string[] {
  const { sceneId, backgroundHex, primaryForeground, count } = options;
  if (count <= 0) {
    return [];
  }

  const bg = normalizeHex(backgroundHex);
  const fills: string[] = [primaryForeground];
  const used = new Set<string>([normalizeHex(primaryForeground), bg]);

  const candidates = paletteSwatches().filter((hex) => {
    const key = normalizeHex(hex);
    if (used.has(key)) {
      return false;
    }
    return contrastRatio(hex, backgroundHex) >= MIN_CONTRAST;
  });

  for (let index = 1; index < count; index += 1) {
    if (candidates.length === 0) {
      fills.push(primaryForeground);
      continue;
    }
    const pick = hashScene(sceneId, 41 + index * 97) % candidates.length;
    const [chosen] = candidates.splice(pick, 1);
    fills.push(chosen ?? primaryForeground);
    if (chosen) {
      used.add(normalizeHex(chosen));
    }
  }

  return fills;
}
