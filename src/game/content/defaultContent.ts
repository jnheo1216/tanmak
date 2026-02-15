import type { GameConfig } from "../config/gameConfig";
import { defaultCharacter } from "./characters/defaultCharacter";
import { createDefaultItems } from "./items/defaultItems";
import { edgeShotPattern } from "./patterns/edgeShot";
import { spiralSeederShotPattern } from "./patterns/spiralSeederShot";
import { splitBurstShotPattern } from "./patterns/splitBurstShot";
import { ContentRegistry } from "./registry";
import { screenClearUltimate } from "./ultimates/screenClear";

export const createDefaultRegistry = (config: GameConfig): ContentRegistry => {
  const registry = new ContentRegistry();

  registry.registerCharacter(defaultCharacter);
  registry.registerUltimate(screenClearUltimate);
  registry.registerBulletPattern(edgeShotPattern);
  registry.registerBulletPattern(splitBurstShotPattern);
  registry.registerBulletPattern(spiralSeederShotPattern);

  for (const itemDef of createDefaultItems(config)) {
    registry.registerItem(itemDef);
  }

  return registry;
};
