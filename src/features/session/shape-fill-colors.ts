import { COLORS } from "../../content/packs";

/** Rough sRGB luminance delta — enough to keep companions readable on pack backgrounds. */
const MIN_LUM_DELTA = 0.22;

const PALETTE_SWATCHES: readonly string[] = (() => {
  const seen = new Set<string>();
  const swatches: string[] = [];
  for (const color of COLORS) {
    for (const hex of [color.foreground, color.background]) {
      const key = hex.toLowerCase();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      swatches.push(hex);
    }
  }
  return swatches;
})();

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
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
 * Primary keeps the scene foreground; companions take other palette swatches
 * that differ from the background. Deterministic from sceneId.
 */
export function pickShapeFillColors(options: {
  sceneId: string;
  backgroundHex: string;
  primaryForeground: string;
  count: number;
}): string[] {
  const { sceneId, backgroundHex, primaryForeground, count } = options;
  const bgKey = backgroundHex.toLowerCase();
  const fills: string[] = [primaryForeground];
  const used = new Set<string>([primaryForeground.toLowerCase(), bgKey]);

  const candidates = PALETTE_SWATCHES.filter((hex) => {
    const key = hex.toLowerCase();
    if (used.has(key)) {
      return false;
    }
    return Math.abs(luminance(hex) - luminance(backgroundHex)) >= MIN_LUM_DELTA;
  });

  for (let index = 1; index < count; index += 1) {
    if (candidates.length === 0) {
      fills.push(primaryForeground);
      continue;
    }
    const pick = hashScene(sceneId, 41 + index * 97) % candidates.length;
    const chosen = candidates.splice(pick, 1)[0] ?? primaryForeground;
    fills.push(chosen);
  }

  return fills;
}
