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
};

function hashScene(sceneId: string, salt: number): number {
  let hash = salt >>> 0;
  for (let index = 0; index < sceneId.length; index += 1) {
    hash = Math.imul(hash ^ sceneId.charCodeAt(index), 0x5bd1e995) >>> 0;
  }
  return hash;
}

export function pickRollDirection(sceneId: string, salt = 0): RollDirection {
  const direction = ROLL_DIRECTIONS[hashScene(sceneId, salt) % ROLL_DIRECTIONS.length];
  if (!direction) {
    throw new RangeError("Unable to pick a roll direction.");
  }
  return direction;
}

/** One primary shape plus companions tumbling in from varied directions. */
export function createRollCast(sceneId: string): readonly RollActor[] {
  const primaryDirection = pickRollDirection(sceneId, 1);
  const companionA = pickRollDirection(sceneId, 7);
  const companionB = pickRollDirection(sceneId, 13);

  return [
    {
      key: `${sceneId}-primary`,
      role: "primary",
      direction: primaryDirection,
      delayMs: 0,
      scale: 1,
    },
    {
      key: `${sceneId}-a`,
      role: "companion",
      direction:
        companionA === primaryDirection ? pickRollDirection(sceneId, 11) : companionA,
      delayMs: 180,
      scale: 0.55,
    },
    {
      key: `${sceneId}-b`,
      role: "companion",
      direction:
        companionB === primaryDirection ? pickRollDirection(sceneId, 19) : companionB,
      delayMs: 320,
      scale: 0.38,
    },
  ];
}
