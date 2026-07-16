export type FaceExpression = {
  /** Eye radius relative to actor size. */
  eyeRadius: number;
  eyeSpread: number;
  eyeY: number;
  /** 0 = smile arc, 1 = open oval mouth. */
  mouthOpen: number;
  mouthWidth: number;
  mouthY: number;
  mouthCurve: number;
};

export type FaceTimeline = {
  morphStartMs: number;
  morphDurationMs: number;
};

const SMILE: FaceExpression = {
  eyeRadius: 0.055,
  eyeSpread: 0.16,
  eyeY: -0.08,
  mouthOpen: 0,
  mouthWidth: 0.18,
  mouthY: 0.16,
  mouthCurve: 0.1,
};

const SURPRISE: FaceExpression = {
  eyeRadius: 0.078,
  eyeSpread: 0.16,
  eyeY: -0.08,
  mouthOpen: 1,
  mouthWidth: 0.1,
  mouthY: 0.17,
  mouthCurve: 0.04,
};

function hashScene(sceneId: string, salt: number): number {
  let hash = salt >>> 0;
  for (let index = 0; index < sceneId.length; index += 1) {
    hash = Math.imul(hash ^ sceneId.charCodeAt(index), 0x5bd1e995) >>> 0;
  }
  return hash;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeInOutCubic(t: number): number {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Deterministic morph window: start at 40–60% of dwell, last 700–1100ms. */
export function resolveFaceTimeline(
  sceneId: string,
  sceneDurationMs: number,
): FaceTimeline {
  const h1 = hashScene(sceneId, 41);
  const h2 = hashScene(sceneId, 97);
  const startRatio = 0.4 + (h1 % 201) / 1_000;
  const morphDurationMs = 700 + (h2 % 401);
  return {
    morphStartMs: sceneDurationMs * startRatio,
    morphDurationMs,
  };
}

/** 0 = smile, 1 = fully surprise. */
export function faceMorphT(elapsedMs: number, timeline: FaceTimeline): number {
  if (elapsedMs <= timeline.morphStartMs) {
    return 0;
  }
  const raw = (elapsedMs - timeline.morphStartMs) / timeline.morphDurationMs;
  return easeInOutCubic(raw);
}

export function interpolateFace(t: number): FaceExpression {
  const x = clamp01(t);
  return {
    eyeRadius: lerp(SMILE.eyeRadius, SURPRISE.eyeRadius, x),
    eyeSpread: lerp(SMILE.eyeSpread, SURPRISE.eyeSpread, x),
    eyeY: lerp(SMILE.eyeY, SURPRISE.eyeY, x),
    mouthOpen: lerp(SMILE.mouthOpen, SURPRISE.mouthOpen, x),
    mouthWidth: lerp(SMILE.mouthWidth, SURPRISE.mouthWidth, x),
    mouthY: lerp(SMILE.mouthY, SURPRISE.mouthY, x),
    mouthCurve: lerp(SMILE.mouthCurve, SURPRISE.mouthCurve, x),
  };
}

export function sampleFaceExpression(
  sceneId: string,
  elapsedMs: number,
  sceneDurationMs: number,
): FaceExpression {
  const timeline = resolveFaceTimeline(sceneId, sceneDurationMs);
  return interpolateFace(faceMorphT(elapsedMs, timeline));
}

/** High-contrast face ink against the filled shape color. */
export function faceInkColor(shapeColor: string): string {
  const hex = shapeColor.replace("#", "");
  if (hex.length !== 6) {
    return "#111111";
  }
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.55 ? "#111111" : "#ffffff";
}
