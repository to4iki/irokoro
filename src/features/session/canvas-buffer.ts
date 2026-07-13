/** Cap backing-store density so full-scene canvases stay affordable on retina. */
export const MAX_CANVAS_DEVICE_PIXEL_RATIO = 2;

export function resolveCanvasBufferSize(
  cssWidth: number,
  cssHeight: number,
  devicePixelRatio: number,
  maxRatio: number = MAX_CANVAS_DEVICE_PIXEL_RATIO,
): { width: number; height: number; ratio: number } {
  const ratio = Math.min(Math.max(devicePixelRatio || 1, 1), maxRatio);
  return {
    width: Math.max(1, Math.floor(cssWidth * ratio)),
    height: Math.max(1, Math.floor(cssHeight * ratio)),
    ratio,
  };
}
