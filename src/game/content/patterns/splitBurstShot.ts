import type { BulletPatternDefinition } from "../types";

const pickSpawnPoint = (side: number, worldWidth: number, worldHeight: number, random01: number): { x: number; y: number } => {
  switch (side) {
    case 0:
      return { x: random01 * worldWidth, y: 0 };
    case 1:
      return { x: worldWidth, y: random01 * worldHeight };
    case 2:
      return { x: random01 * worldWidth, y: worldHeight };
    default:
      return { x: 0, y: random01 * worldHeight };
  }
};

const getFragmentCount = (elapsedFromSec: number): number => {
  if (elapsedFromSec >= 90) {
    return 12;
  }
  if (elapsedFromSec >= 30) {
    return 10;
  }
  return 8;
};

const pickSplitDelayMs = (rng: { next: () => number; nextBetween: (min: number, max: number) => number }): number => {
  // Two timing bands create a much larger per-bullet spread than a single narrow uniform range.
  const fastBand = rng.next() < 0.5;
  if (fastBand) {
    return rng.nextBetween(500, 900);
  }
  return rng.nextBetween(1100, 1950);
};

export const splitBurstShotPattern: BulletPatternDefinition = {
  id: "split-burst-shot",
  spawn: (ctx, difficulty) => {
    const side = Math.floor(ctx.rng.nextBetween(0, 4));
    const spawn = pickSpawnPoint(side, ctx.world.width, ctx.world.height, ctx.rng.next());

    const dx = ctx.playerPosition.x - spawn.x;
    const dy = ctx.playerPosition.y - spawn.y;
    const baseAngle = Math.atan2(dy, dx);
    const angle = baseAngle + ctx.rng.nextBetween(-ctx.angleJitterRad * 0.5, ctx.angleJitterRad * 0.5);

    return [
      {
        position: { x: spawn.x, y: spawn.y },
        velocity: {
          x: Math.cos(angle) * ctx.bulletSpeed * 0.72,
          y: Math.sin(angle) * ctx.bulletSpeed * 0.72
        },
        radius: ctx.bulletRadius * 1.15,
        damage: Math.max(4, ctx.bulletDamage * 0.75),
        behavior: {
          type: "split-on-timeout",
          triggerAfterMs: pickSplitDelayMs(ctx.rng),
          fragmentCount: getFragmentCount(difficulty.fromSec),
          fragmentSpeedMultiplier: 1.08,
          fragmentRadiusMultiplier: 0.82,
          fragmentDamageMultiplier: 0.65,
          startAngleRad: ctx.rng.nextBetween(0, Math.PI * 2)
        }
      }
    ];
  }
};
