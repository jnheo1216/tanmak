import type { ItemEntity } from "../entities/types";
import type { EngineState } from "../engine/engineState";
import { distanceSq } from "../utils/vector";

export const resolveBulletCollisions = (
  state: EngineState,
  invulnerabilityMs: number
): { tookDamage: boolean } => {
  let tookDamage = false;
  const player = state.player;

  for (const bullet of state.bullets) {
    if (!bullet.alive) {
      continue;
    }

    const radiusSum = player.radius + bullet.radius;
    if (distanceSq(player.position, bullet.position) <= radiusSum * radiusSum) {
      bullet.alive = false;

      if (state.nowMs >= player.invulnerableUntilMs) {
        player.hp = Math.max(0, player.hp - bullet.damage);
        player.invulnerableUntilMs = state.nowMs + invulnerabilityMs;
        tookDamage = true;
      }
    }
  }

  state.bullets = state.bullets.filter((bullet) => bullet.alive);
  return { tookDamage };
};

export const collectTouchedItems = (state: EngineState): ItemEntity[] => {
  const collected: ItemEntity[] = [];
  const player = state.player;

  for (const item of state.items) {
    if (!item.alive) {
      continue;
    }

    const radiusSum = player.radius + item.radius;
    if (distanceSq(player.position, item.position) <= radiusSum * radiusSum) {
      item.alive = false;
      collected.push(item);
    }
  }

  state.items = state.items.filter((item) => item.alive);
  return collected;
};
