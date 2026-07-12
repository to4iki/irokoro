import { describe, expect, it } from "vitest";
import { COLORS } from "./packs";

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const channels = [0, 1, 2].map((index) => {
    const channel = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const [r = 0, g = 0, b = 0] = channels;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: string, b: string): number {
  const light = Math.max(luminance(a), luminance(b));
  const dark = Math.min(luminance(a), luminance(b));
  return (light + 0.05) / (dark + 0.05);
}

describe("COLORS", () => {
  it("keeps punchy high-contrast pairs for baby-book readability", () => {
    for (const color of COLORS) {
      expect(contrastRatio(color.background, color.foreground)).toBeGreaterThanOrEqual(
        3,
      );
    }
  });
});
