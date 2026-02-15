import type { GameConfig } from "../config/gameConfig";
import type { BulletPatternDefinition } from "../content/types";
import type { DifficultyTier } from "../entities/types";
import type { EngineState } from "../engine/engineState";
import type { Rng } from "../utils/rng";

interface BulletSpawnParams {
  state: EngineState;
  config: GameConfig;
  difficulty: DifficultyTier;
  pickPattern: () => BulletPatternDefinition;
  rng: Rng;
  nextEntityId: () => string;
  dtMs: number;
}

export const updateBulletSpawning = ({
  state,
  config,
  difficulty,
  pickPattern,
  rng,
  nextEntityId,
  dtMs
}: BulletSpawnParams): void => {
  state.bulletSpawnTimerMs -= dtMs;

  while (state.bulletSpawnTimerMs <= 0) {
    state.bulletSpawnTimerMs += difficulty.spawnIntervalMs;

    if (state.bullets.length >= difficulty.maxBullets) {
      continue;
    }

    const pattern = pickPattern();
    state.activePatternId = pattern.id;

    const spawns = pattern.spawn(
      {
        world: config.world,
        playerPosition: state.player.position,
        bulletSpeed: difficulty.bulletSpeed,
        bulletRadius: config.combat.bulletRadius,
        bulletDamage: config.combat.bulletContactDamage,
        angleJitterRad: config.combat.bulletAngleJitterRad,
        rng
      },
      difficulty
    );

    for (const spawn of spawns) {
      if (state.bullets.length >= difficulty.maxBullets) {
        break;
      }
      state.bullets.push({
        id: nextEntityId(),
        alive: true,
        radius: spawn.radius,
        damage: spawn.damage,
        ageMs: 0,
        behavior: spawn.behavior ? { ...spawn.behavior } : undefined,
        position: { ...spawn.position },
        velocity: { ...spawn.velocity }
      });
    }
  }
};
