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
  sceneId: string;
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

type Orbit = {
  ampX: number;
  ampY: number;
  periodXMs: number;
  periodYMs: number;
  directionX: number;
  directionY: number;
};

export const ENTRY_DURATION_MS = 1_350;
const SPIN_PER_DISTANCE = 2.85;

/** Start just outside each edge of the full scene stage (pose units ±1 = edge). */
const ENTRY_OFFSET: Record<RollDirection, Vec2> = {
  left: { x: -1.18, y: 0.08 },
  right: { x: 1.18, y: -0.06 },
  top: { x: -0.04, y: -1.18 },
  bottom: { x: 0.06, y: 1.18 },
  "top-left": { x: -1.12, y: -1.12 },
  "top-right": { x: 1.12, y: -1.12 },
  "bottom-left": { x: -1.12, y: 1.12 },
  "bottom-right": { x: 1.12, y: 1.12 },
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
      sceneId,
      role: "primary",
      direction: primaryDirection,
      delayMs: 0,
      scale: 1,
      settleX: 0,
      settleY: 0,
    },
    {
      key: `${sceneId}-a`,
      sceneId,
      role: "companion",
      direction: differentDirection(sceneId, 7, primaryDirection),
      delayMs: 180,
      scale: 0.55,
      settleX: -0.18,
      settleY: 0.14,
    },
    {
      key: `${sceneId}-b`,
      sceneId,
      role: "companion",
      direction: differentDirection(sceneId, 13, primaryDirection),
      delayMs: 320,
      scale: 0.38,
      settleX: 0.2,
      settleY: -0.16,
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

function actorSalt(actor: RollActor): number {
  if (actor.role === "primary") {
    return 31;
  }
  let salt = 97;
  for (let index = 0; index < actor.key.length; index += 1) {
    salt = Math.imul(salt ^ actor.key.charCodeAt(index), 0x85ebca6b) >>> 0;
  }
  return salt;
}

/** Deterministic large-amplitude Lissajous orbit per scene / actor. */
function orbitFor(actor: RollActor): Orbit {
  const salt = actorSalt(actor);
  const h1 = hashScene(actor.sceneId, salt);
  const h2 = hashScene(actor.sceneId, salt + 101);
  const h3 = hashScene(actor.sceneId, salt + 211);

  const baseAmp = actor.role === "primary" ? 0.52 : 0.38;
  const ampX = baseAmp * (0.88 + (h1 % 120) / 1_000);
  const ampY = baseAmp * (0.88 + (h2 % 120) / 1_000);

  return {
    ampX,
    ampY,
    // Periods span most of a 6–8s dwell so motion crosses the stage widely.
    periodXMs: 5_200 + (h1 % 2_200),
    periodYMs: 3_800 + (h2 % 2_600),
    directionX: (h3 & 1) === 0 ? 1 : -1,
    directionY: (h3 & 2) === 0 ? 1 : -1,
  };
}

function poseAtProgress(actor: RollActor, progress: number) {
  const from = ENTRY_OFFSET[actor.direction];
  const eased = easeOutCubic(progress);
  const x = lerp(from.x, actor.settleX, eased);
  const y = lerp(from.y, actor.settleY, eased);
  const total = Math.hypot(actor.settleX - from.x, actor.settleY - from.y);
  return { x, y, distance: total * eased };
}

function orbitPose(actor: RollActor, tumbleMs: number) {
  const orbit = orbitFor(actor);
  const angleX = (tumbleMs / orbit.periodXMs) * Math.PI * 2;
  const angleY = (tumbleMs / orbit.periodYMs) * Math.PI * 2;
  const x = actor.settleX + Math.sin(angleX) * orbit.ampX * orbit.directionX;
  const y = actor.settleY + Math.sin(angleY) * orbit.ampY * orbit.directionY;
  const speed = Math.hypot(
    (orbit.ampX * Math.PI * 2) / orbit.periodXMs,
    (orbit.ampY * Math.PI * 2) / orbit.periodYMs,
  );
  return { x, y, travel: tumbleMs * speed };
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
  const { x, y, travel } = orbitPose(actor, tumbleMs);

  return {
    x,
    y,
    rotationRad: (entryDistance + travel) * SPIN_PER_DISTANCE * sign,
    scale: actor.scale * (1 + Math.sin(tumbleMs / 1_800) * 0.03),
    opacity: 1,
  };
}
