import type { BulletEntity, InputSnapshot, ItemEntity, PlayerEntity } from "../entities/types";
import { clamp } from "../utils/vector";

interface WorldBounds {
  width: number;
  height: number;
}

export const updatePlayerMovement = (
  player: PlayerEntity,
  input: InputSnapshot,
  dtSec: number,
  world: WorldBounds
): void => {
  player.position.x += input.moveX * player.moveSpeed * dtSec;
  player.position.y += input.moveY * player.moveSpeed * dtSec;

  player.position.x = clamp(player.position.x, player.radius, world.width - player.radius);
  player.position.y = clamp(player.position.y, player.radius, world.height - player.radius);
};

export const updateBulletMovement = (bullets: BulletEntity[], dtSec: number): void => {
  for (const bullet of bullets) {
    bullet.position.x += bullet.velocity.x * dtSec;
    bullet.position.y += bullet.velocity.y * dtSec;
  }
};

export const updateItemMovement = (items: ItemEntity[], dtSec: number): void => {
  for (const item of items) {
    item.position.x += item.velocity.x * dtSec;
    item.position.y += item.velocity.y * dtSec;
  }
};

export const cullOutOfBoundsBullets = (
  bullets: BulletEntity[],
  world: WorldBounds,
  margin: number
): BulletEntity[] => {
  return bullets.filter((bullet) => {
    const inX = bullet.position.x >= -margin && bullet.position.x <= world.width + margin;
    const inY = bullet.position.y >= -margin && bullet.position.y <= world.height + margin;
    return bullet.alive && inX && inY;
  });
};

export const cullOutOfBoundsItems = (items: ItemEntity[], world: WorldBounds, margin: number): ItemEntity[] => {
  return items.filter((item) => {
    const inX = item.position.x >= -margin && item.position.x <= world.width + margin;
    const inY = item.position.y >= -margin && item.position.y <= world.height + margin;
    return item.alive && inX && inY;
  });
};
