import type { BulletEntity } from "../entities/types";
import type { EngineState } from "../engine/engineState";

interface BurstSystemParams {
  state: EngineState;
  dtMs: number;
  nextEntityId: () => string;
  maxBullets: number;
}

const createFragments = (
  bullet: BulletEntity,
  nextEntityId: () => string,
  availableSlots: number
): BulletEntity[] => {
  const behavior = bullet.behavior;
  if (!behavior || behavior.type !== "split-on-timeout") {
    return [];
  }

  const fragmentCount = Math.max(4, Math.floor(behavior.fragmentCount));
  const spawnCount = Math.min(fragmentCount, Math.max(0, availableSlots));
  if (spawnCount <= 0) {
    return [];
  }

  const parentSpeed = Math.hypot(bullet.velocity.x, bullet.velocity.y);
  const fragmentSpeed = Math.max(40, parentSpeed * behavior.fragmentSpeedMultiplier);
  const fragmentRadius = Math.max(2.5, bullet.radius * behavior.fragmentRadiusMultiplier);
  const fragmentDamage = Math.max(1, bullet.damage * behavior.fragmentDamageMultiplier);

  const fragments: BulletEntity[] = [];
  for (let i = 0; i < spawnCount; i += 1) {
    const angle = behavior.startAngleRad + (i * Math.PI * 2) / fragmentCount;
    fragments.push({
      id: nextEntityId(),
      alive: true,
      position: { x: bullet.position.x, y: bullet.position.y },
      radius: fragmentRadius,
      velocity: {
        x: Math.cos(angle) * fragmentSpeed,
        y: Math.sin(angle) * fragmentSpeed
      },
      damage: fragmentDamage,
      ageMs: 0
    });
  }

  return fragments;
};

const createSpiralEmission = (
  bullet: BulletEntity,
  nextEntityId: () => string,
  availableSlots: number
): BulletEntity[] => {
  const behavior = bullet.behavior;
  if (!behavior || behavior.type !== "spiral-emitter") {
    return [];
  }

  const emissionCount = Math.min(
    Math.max(1, Math.floor(behavior.bulletsPerEmission)),
    Math.max(0, availableSlots)
  );
  if (emissionCount <= 0) {
    return [];
  }

  const parentSpeed = Math.hypot(bullet.velocity.x, bullet.velocity.y);
  const emitSpeed = Math.max(55, parentSpeed * behavior.emitSpeedMultiplier);
  const emitRadius = Math.max(2.5, bullet.radius * behavior.emitRadiusMultiplier);
  const emitDamage = Math.max(1, bullet.damage * behavior.emitDamageMultiplier);

  const bullets: BulletEntity[] = [];
  for (let i = 0; i < emissionCount; i += 1) {
    const angleOffset = (i * Math.PI * 2) / Math.max(1, behavior.bulletsPerEmission);
    const angle = behavior.currentAngleRad + angleOffset;

    bullets.push({
      id: nextEntityId(),
      alive: true,
      position: { x: bullet.position.x, y: bullet.position.y },
      radius: emitRadius,
      velocity: {
        x: Math.cos(angle) * emitSpeed,
        y: Math.sin(angle) * emitSpeed
      },
      damage: emitDamage,
      ageMs: 0
    });
  }

  return bullets;
};

export const updateBurstBullets = ({ state, dtMs, nextEntityId, maxBullets }: BurstSystemParams): void => {
  let activeCount = state.bullets.length;
  const spawned: BulletEntity[] = [];

  for (const bullet of state.bullets) {
    if (!bullet.alive) {
      continue;
    }

    bullet.ageMs += dtMs;

    const behavior = bullet.behavior;
    if (!behavior) {
      continue;
    }

    if (behavior.type === "split-on-timeout") {
      if (bullet.ageMs < behavior.triggerAfterMs) {
        continue;
      }

      bullet.alive = false;
      activeCount -= 1;

      const availableSlots = Math.max(0, maxBullets - (activeCount + spawned.length));
      const fragments = createFragments(bullet, nextEntityId, availableSlots);
      spawned.push(...fragments);
      continue;
    }

    if (behavior.type === "spiral-emitter") {
      while (bullet.ageMs >= behavior.nextEmitAtMs) {
        const availableSlots = Math.max(0, maxBullets - (activeCount + spawned.length));
        const emissions = createSpiralEmission(bullet, nextEntityId, availableSlots);
        spawned.push(...emissions);
        behavior.currentAngleRad += behavior.turnRateRad;
        behavior.nextEmitAtMs += behavior.emitIntervalMs;
      }
    }
  }

  state.bullets = state.bullets.filter((bullet) => bullet.alive);
  if (spawned.length > 0) {
    state.bullets.push(...spawned);
  }
};
