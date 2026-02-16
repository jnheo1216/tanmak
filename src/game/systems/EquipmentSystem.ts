import type { GameConfig } from "../config/gameConfig";
import type { BarrierEntity, EquipmentType } from "../entities/types";
import type { EngineState } from "../engine/engineState";
import { distanceSq } from "../utils/vector";

interface UpgradeResult {
  leveledUp: boolean;
  reachedMax: boolean;
}

const getLevelValue = (level: number, values: number[]): number => {
  if (level <= 0 || values.length === 0) {
    return 0;
  }
  const index = Math.min(values.length - 1, level - 1);
  return values[index] ?? 0;
};

export const getMagnetRangeForLevel = (level: number, config: GameConfig): number => {
  return getLevelValue(level, config.equipment.magnetRangeByLevel);
};

export const getMagnetPullSpeedForLevel = (level: number, config: GameConfig): number => {
  return getLevelValue(level, config.equipment.magnetPullSpeedByLevel);
};

export const getBarrierIntervalMsForLevel = (level: number, config: GameConfig): number => {
  return getLevelValue(level, config.equipment.barrierIntervalMsByLevel);
};

export const getBarrierMaxCountForLevel = (level: number, config: GameConfig): number => {
  return getLevelValue(level, config.equipment.barrierMaxCountByLevel);
};

const rebalanceBarrierAngles = (barriers: BarrierEntity[]): void => {
  if (barriers.length === 0) {
    return;
  }

  const baseAngle = barriers[0]?.orbitAngleRad ?? 0;
  const step = (Math.PI * 2) / barriers.length;

  for (let index = 0; index < barriers.length; index += 1) {
    const barrier = barriers[index];
    if (!barrier) {
      continue;
    }
    barrier.orbitAngleRad = baseAngle + index * step;
  }
};

export const upgradeEquipmentLevel = (
  state: EngineState,
  type: EquipmentType,
  config: GameConfig
): UpgradeResult => {
  if (type === "magnet") {
    if (state.equipment.magnetLevel >= state.equipment.maxLevel) {
      return { leveledUp: false, reachedMax: true };
    }

    state.equipment.magnetLevel += 1;
    return {
      leveledUp: true,
      reachedMax: state.equipment.magnetLevel >= state.equipment.maxLevel
    };
  }

  if (state.equipment.barrierGeneratorLevel >= state.equipment.maxLevel) {
    return { leveledUp: false, reachedMax: true };
  }

  state.equipment.barrierGeneratorLevel += 1;

  const currentInterval = getBarrierIntervalMsForLevel(state.equipment.barrierGeneratorLevel, config);
  if (currentInterval > 0 && (state.barrierSpawnCooldownMs <= 0 || state.barrierSpawnCooldownMs > currentInterval)) {
    state.barrierSpawnCooldownMs = currentInterval;
  }

  return {
    leveledUp: true,
    reachedMax: state.equipment.barrierGeneratorLevel >= state.equipment.maxLevel
  };
};

export const applyMagnetAttraction = (state: EngineState, config: GameConfig, dtSec: number): void => {
  const level = state.equipment.magnetLevel;
  if (level <= 0) {
    return;
  }

  const range = getMagnetRangeForLevel(level, config);
  const pullSpeed = getMagnetPullSpeedForLevel(level, config);
  if (range <= 0 || pullSpeed <= 0) {
    return;
  }

  const rangeSq = range * range;
  const maxVelocity = pullSpeed * 1.8;

  for (const item of state.items) {
    const dx = state.player.position.x - item.position.x;
    const dy = state.player.position.y - item.position.y;
    const distSq = dx * dx + dy * dy;

    if (distSq <= 0 || distSq > rangeSq) {
      continue;
    }

    const dist = Math.sqrt(distSq);
    const dirX = dx / dist;
    const dirY = dy / dist;

    item.velocity.x += dirX * pullSpeed * dtSec;
    item.velocity.y += dirY * pullSpeed * dtSec;

    const velocityMagnitude = Math.hypot(item.velocity.x, item.velocity.y);
    if (velocityMagnitude > maxVelocity && velocityMagnitude > 0) {
      const scale = maxVelocity / velocityMagnitude;
      item.velocity.x *= scale;
      item.velocity.y *= scale;
    }
  }
};

export const updateBarrierGenerator = (
  state: EngineState,
  config: GameConfig,
  dtMs: number,
  nextEntityId: () => string
): void => {
  const level = state.equipment.barrierGeneratorLevel;
  if (level <= 0) {
    return;
  }

  const maxCount = getBarrierMaxCountForLevel(level, config);
  const intervalMs = getBarrierIntervalMsForLevel(level, config);
  if (maxCount <= 0 || intervalMs <= 0) {
    return;
  }

  if (state.barriers.length >= maxCount) {
    if (state.barrierSpawnCooldownMs <= 0) {
      state.barrierSpawnCooldownMs = intervalMs;
    }
    return;
  }

  state.barrierSpawnCooldownMs -= dtMs;

  while (state.barrierSpawnCooldownMs <= 0 && state.barriers.length < maxCount) {
    state.barriers.push({
      id: nextEntityId(),
      alive: true,
      position: {
        x: state.player.position.x,
        y: state.player.position.y
      },
      radius: config.equipment.barrierRadius,
      orbitAngleRad: 0,
      orbitDistance: config.equipment.barrierOrbitDistance
    });

    rebalanceBarrierAngles(state.barriers);
    state.barrierSpawnCooldownMs += intervalMs;
  }
};

export const updateBarrierOrbit = (state: EngineState, config: GameConfig, dtSec: number): void => {
  if (state.barriers.length === 0) {
    return;
  }

  const angularSpeed = config.equipment.barrierOrbitAngularSpeedRad;
  for (const barrier of state.barriers) {
    if (!barrier.alive) {
      continue;
    }

    barrier.orbitAngleRad += angularSpeed * dtSec;
    barrier.position.x = state.player.position.x + Math.cos(barrier.orbitAngleRad) * barrier.orbitDistance;
    barrier.position.y = state.player.position.y + Math.sin(barrier.orbitAngleRad) * barrier.orbitDistance;
  }
};

export const resolveBarrierBulletCollisions = (state: EngineState): void => {
  if (state.barriers.length === 0 || state.bullets.length === 0) {
    return;
  }

  for (const barrier of state.barriers) {
    if (!barrier.alive) {
      continue;
    }

    for (const bullet of state.bullets) {
      if (!bullet.alive) {
        continue;
      }

      const radiusSum = barrier.radius + bullet.radius;
      if (distanceSq(barrier.position, bullet.position) <= radiusSum * radiusSum) {
        barrier.alive = false;
        bullet.alive = false;
        break;
      }
    }
  }

  state.barriers = state.barriers.filter((barrier) => barrier.alive);
  state.bullets = state.bullets.filter((bullet) => bullet.alive);
};
