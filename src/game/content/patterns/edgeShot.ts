import type { BulletPatternDefinition } from "../types";

const pickSpawnPoint = (
  side: number,
  worldWidth: number,
  worldHeight: number,
  random01: number,
  random02: number
): { x: number; y: number } => {
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

export const edgeShotPattern: BulletPatternDefinition = {
  id: "edge-shot",
  spawn: (ctx) => {
    const side = Math.floor(ctx.rng.nextBetween(0, 4));
    const spawn = pickSpawnPoint(side, ctx.world.width, ctx.world.height, ctx.rng.next(), ctx.rng.next());

    const dx = ctx.playerPosition.x - spawn.x;
    const dy = ctx.playerPosition.y - spawn.y;
    const baseAngle = Math.atan2(dy, dx);
    const angle = baseAngle + ctx.rng.nextBetween(-ctx.angleJitterRad, ctx.angleJitterRad);

    return [
      {
        position: { x: spawn.x, y: spawn.y },
        velocity: {
          x: Math.cos(angle) * ctx.bulletSpeed,
          y: Math.sin(angle) * ctx.bulletSpeed
        },
        radius: ctx.bulletRadius,
        damage: ctx.bulletDamage
      }
    ];
  }
};
