/** Peak scale for the calm “pon” reaction (spec ~1.35). */
export const PON_PEAK_SCALE = 1.35;
export const PON_RISE_MS = 100;
export const PON_FALL_MS = 220;
export const PON_TOTAL_MS = PON_RISE_MS + PON_FALL_MS;
export const PON_RATE_LIMIT_MS = 250;
/** Beyond this pose-space distance, fall back to the primary actor. */
export const PON_HIT_RADIUS = 0.55;

type PosePoint = {
  x: number;
  y: number;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** Elapsed since reaction start → scale multiplier (1 when idle / finished). */
export function ponScaleFactor(elapsedMs: number): number {
  if (elapsedMs < 0 || elapsedMs >= PON_TOTAL_MS) {
    return 1;
  }

  if (elapsedMs <= PON_RISE_MS) {
    const t = elapsedMs / PON_RISE_MS;
    return 1 + (PON_PEAK_SCALE - 1) * easeOutCubic(t);
  }

  const t = (elapsedMs - PON_RISE_MS) / PON_FALL_MS;
  return PON_PEAK_SCALE + (1 - PON_PEAK_SCALE) * smoothstep(t);
}

/**
 * Nearest actor by center distance. If all actors are outside the hit radius,
 * returns the primary actor (index 0).
 */
export function pickPonActorIndex(
  poses: readonly PosePoint[],
  tapX: number,
  tapY: number,
  primaryIndex = 0,
): number {
  if (poses.length === 0) {
    return primaryIndex;
  }

  let bestIndex = primaryIndex;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let index = 0; index < poses.length; index += 1) {
    const pose = poses[index];
    if (!pose) {
      continue;
    }
    const dist = Math.hypot(pose.x - tapX, pose.y - tapY);
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = index;
    }
  }

  return bestDist > PON_HIT_RADIUS ? primaryIndex : bestIndex;
}

/** Convert CSS pixel coordinates on the canvas into normalized pose space. */
export function cssPointToPose(
  cssX: number,
  cssY: number,
  cssWidth: number,
  cssHeight: number,
): PosePoint {
  const width = Math.max(1, cssWidth);
  const height = Math.max(1, cssHeight);
  return {
    x: (cssX / width) * 2 - 1,
    y: (cssY / height) * 2 - 1,
  };
}

/**
 * Ignore while a reaction is still playing in animation time (完了まで無視),
 * and enforce the 250ms wall-clock rate limit between starts.
 */
export function canStartPon(options: {
  nowMs: number;
  lastStartMs: number | null;
  /** Animation elapsed since the active pon started; null when idle. */
  reactionElapsedMs: number | null;
}): boolean {
  const { nowMs, lastStartMs, reactionElapsedMs } = options;
  if (reactionElapsedMs !== null && reactionElapsedMs < PON_TOTAL_MS) {
    return false;
  }
  if (lastStartMs !== null && nowMs - lastStartMs < PON_RATE_LIMIT_MS) {
    return false;
  }
  return true;
}
