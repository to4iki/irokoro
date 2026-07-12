export const ROLL_DIRECTIONS = [
  "left",
  "right",
  "top",
  "bottom",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
] as const;

export type RollDirection = (typeof ROLL_DIRECTIONS)[number];

export type RollActor = {
  key: string;
  role: "primary" | "companion";
  direction: RollDirection;
  delayMs: number;
  scale: number;
  settleX: number;
  settleY: number;
};

export type ActorPose = {
  x: number;
  y: number;
  rotationRad: number;
  scale: number;
  opacity: number;
};

type Vec2 = { x: number; y: number };

export const ENTRY_DURATION_MS = 1_350;
const TUMBLE_PERIOD_MS = 2_800;
const SPIN_PER_DISTANCE = 2.85;

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

function hashScene(sceneId: string, salt: number): number {
  let hash = salt >>> 0;
  for (let index = 0; index < sceneId.length; index += 1) {
    hash = Math.imul(hash ^ sceneId.charCodeAt(index), 0x5bd1e995) >>> 0;
  }
  return hash;
}

function pickRollDirection(sceneId: string, salt: number): RollDirection {
  const direction = ROLL_DIRECTIONS[hashScene(sceneId, salt) % ROLL_DIRECTIONS.length];
  if (!direction) {
    throw new RangeError("Unable to pick a roll direction.");
  }
  return direction;
}

function differentDirection(
  sceneId: string,
  salt: number,
  avoid: RollDirection,
): RollDirection {
  const direction = pickRollDirection(sceneId, salt);
  return direction === avoid ? pickRollDirection(sceneId, salt + 17) : direction;
}

/** One primary shape plus companions tumbling in from varied directions. */
export function createRollCast(sceneId: string): readonly RollActor[] {
  const primaryDirection = pickRollDirection(sceneId, 1);

  return [
    {
      key: `${sceneId}-primary`,
      role: "primary",
      direction: primaryDirection,
      delayMs: 0,
      scale: 1,
      settleX: 0,
      settleY: 0,
    },
    {
      key: `${sceneId}-a`,
      role: "companion",
      direction: differentDirection(sceneId, 7, primaryDirection),
      delayMs: 180,
      scale: 0.55,
      settleX: -0.32,
      settleY: 0.26,
    },
    {
      key: `${sceneId}-b`,
      role: "companion",
      direction: differentDirection(sceneId, 13, primaryDirection),
      delayMs: 320,
      scale: 0.38,
      settleX: 0.34,
      settleY: -0.28,
    },
  ];
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function easeOutCubic(t: number): number {
  const x = clamp01(t);
  return 1 - (1 - x) ** 3;
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

function spinSign(direction: RollDirection): number {
  return direction.includes("right") || direction === "bottom" ? -1 : 1;
}

function poseAtProgress(actor: RollActor, progress: number) {
  const from = ENTRY_OFFSET[actor.direction];
  const eased = easeOutCubic(progress);
  const x = lerp(from.x, actor.settleX, eased);
  const y = lerp(from.y, actor.settleY, eased);
  const total = Math.hypot(actor.settleX - from.x, actor.settleY - from.y);
  return { x, y, distance: total * eased };
}

export function sampleActorPose(actor: RollActor, elapsedMs: number): ActorPose {
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

  const entryDistance = poseAtProgress(actor, 1).distance;
  const tumbleMs = local - ENTRY_DURATION_MS;
  const phase = (tumbleMs / TUMBLE_PERIOD_MS) * Math.PI * 2;
  const radius = actor.role === "primary" ? 0.1 : 0.07;
  const tumbleTravel = (tumbleMs / TUMBLE_PERIOD_MS) * 0.55;

  return {
    x: actor.settleX + Math.cos(phase) * radius,
    y: actor.settleY + Math.sin(phase * 1.15) * radius,
    rotationRad: (entryDistance + tumbleTravel) * SPIN_PER_DISTANCE * sign,
    scale: actor.scale * (1 + Math.sin(phase) * 0.04),
    opacity: 1,
  };
}
