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

const getBulletsPerEmission = (elapsedFromSec: number): number => {
  if (elapsedFromSec >= 90) {
    return 4;
  }
  if (elapsedFromSec >= 30) {
    return 3;
  }
  return 2;
};

export const spiralSeederShotPattern: BulletPatternDefinition = {
  id: "spiral-seeder-shot",
  spawn: (ctx, difficulty) => {
    const side = Math.floor(ctx.rng.nextBetween(0, 4));
    const spawn = pickSpawnPoint(side, ctx.world.width, ctx.world.height, ctx.rng.next());

    const dx = ctx.playerPosition.x - spawn.x;
    const dy = ctx.playerPosition.y - spawn.y;
    const baseAngle = Math.atan2(dy, dx);
    const angle = baseAngle + ctx.rng.nextBetween(-ctx.angleJitterRad * 0.45, ctx.angleJitterRad * 0.45);

    const clockwise = ctx.rng.next() < 0.5;
    const turnRate = (clockwise ? 1 : -1) * ctx.rng.nextBetween(0.38, 0.58);

    return [
      {
        position: { x: spawn.x, y: spawn.y },
        velocity: {
          x: Math.cos(angle) * difficulty.bulletSpeed * 0.42,
          y: Math.sin(angle) * difficulty.bulletSpeed * 0.42
        },
        radius: ctx.bulletRadius * 1.22,
        damage: Math.max(4, ctx.bulletDamage * 0.7),
        behavior: {
          type: "spiral-emitter",
          emitIntervalMs: ctx.rng.nextBetween(170, 260),
          nextEmitAtMs: ctx.rng.nextBetween(240, 430),
          bulletsPerEmission: getBulletsPerEmission(difficulty.fromSec),
          turnRateRad: turnRate,
          currentAngleRad: ctx.rng.nextBetween(0, Math.PI * 2),
          emitSpeedMultiplier: 1.08,
          emitRadiusMultiplier: 0.72,
          emitDamageMultiplier: 0.55
        }
      }
    ];
  }
};
