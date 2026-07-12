import type { RollActor, RollDirection } from "./roll";

export const ENTRY_DURATION_MS = 1_350;
const TUMBLE_PERIOD_MS = 2_800;
/** Radians of spin per unit of normalized travel distance. */
const SPIN_PER_DISTANCE = 2.85;

export type ActorPose = {
  x: number;
  y: number;
  rotationRad: number;
  scale: number;
  opacity: number;
};

type Vec2 = { x: number; y: number };

const ENTRY_OFFSET: Record<RollDirection, Vec2> = {
  left: { x: -1.15, y: 0.08 },
  right: { x: 1.15, y: -0.06 },
  top: { x: -0.04, y: -1.15 },
  bottom: { x: 0.06, y: 1.15 },
  "top-left": { x: -1.05, y: -1.05 },
  "top-right": { x: 1.05, y: -1.05 },
  "bottom-left": { x: -1.05, y: 1.05 },
  "bottom-right": { x: 1.05, y: 1.05 },
};

const SETTLE_OFFSET: Record<RollActor["role"], Vec2> = {
  primary: { x: 0, y: 0 },
  companion: { x: 0, y: 0 },
};

function companionSettle(actor: RollActor): Vec2 {
  if (actor.role === "primary") {
    return SETTLE_OFFSET.primary;
  }
  // Stable offsets from key suffix keep companions apart without DOM nth-child.
  return actor.key.endsWith("-a") ? { x: -0.32, y: 0.26 } : { x: 0.34, y: -0.28 };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Smooth ease-out used for roll-in progress. */
export function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function spinSign(direction: RollDirection): number {
  return direction.includes("right") || direction === "bottom" ? -1 : 1;
}

function entryEndpoints(actor: RollActor): { from: Vec2; to: Vec2 } {
  return {
    from: ENTRY_OFFSET[actor.direction],
    to: companionSettle(actor),
  };
}

function poseAtProgress(
  actor: RollActor,
  progress: number,
): {
  x: number;
  y: number;
  distance: number;
} {
  const { from, to } = entryEndpoints(actor);
  const eased = easeOutCubic(progress);
  const x = lerp(from.x, to.x, eased);
  const y = lerp(from.y, to.y, eased);
  const total = Math.hypot(to.x - from.x, to.y - from.y);
  return { x, y, distance: total * eased };
}

export function sampleRollDistance(
  actor: RollActor,
  elapsedMs: number,
  _stageSize: number,
): number {
  const local = Math.max(0, elapsedMs - actor.delayMs);
  if (local <= ENTRY_DURATION_MS) {
    return poseAtProgress(actor, local / ENTRY_DURATION_MS).distance;
  }

  const entryDistance = poseAtProgress(actor, 1).distance;
  const tumbleMs = local - ENTRY_DURATION_MS;
  const tumbleTravel = (tumbleMs / TUMBLE_PERIOD_MS) * 0.55;
  return entryDistance + tumbleTravel;
}

export function sampleActorPose(
  actor: RollActor,
  elapsedMs: number,
  _stageSize: number,
): ActorPose {
  const local = Math.max(0, elapsedMs - actor.delayMs);
  const sign = spinSign(actor.direction);

  if (local <= ENTRY_DURATION_MS) {
    const progress = local / ENTRY_DURATION_MS;
    const { x, y, distance } = poseAtProgress(actor, progress);
    const scalePulse = lerp(0.72, 1, easeOutCubic(progress)) * actor.scale;
    const overshoot =
      progress > 0.55 && progress < 0.85
        ? 1 + Math.sin((progress - 0.55) * Math.PI) * 0.06
        : 1;

    return {
      x,
      y,
      rotationRad: distance * SPIN_PER_DISTANCE * sign,
      scale: scalePulse * overshoot,
      opacity: lerp(0.75, 1, easeOutCubic(progress)),
    };
  }

  const settle = companionSettle(actor);
  const entryDistance = poseAtProgress(actor, 1).distance;
  const tumbleMs = local - ENTRY_DURATION_MS;
  const phase = (tumbleMs / TUMBLE_PERIOD_MS) * Math.PI * 2;
  const radius = actor.role === "primary" ? 0.1 : 0.07;
  const x = settle.x + Math.cos(phase) * radius;
  const y = settle.y + Math.sin(phase * 1.15) * radius;
  const tumbleTravel = (tumbleMs / TUMBLE_PERIOD_MS) * 0.55;

  return {
    x,
    y,
    rotationRad: (entryDistance + tumbleTravel) * SPIN_PER_DISTANCE * sign,
    scale: actor.scale * (1 + Math.sin(phase) * 0.04),
    opacity: 1,
  };
}
