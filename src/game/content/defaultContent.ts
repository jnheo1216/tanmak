import type { GameConfig } from "../config/gameConfig";
import { defaultCharacter } from "./characters/defaultCharacter";
import { createDefaultItems } from "./items/defaultItems";
import { edgeShotPattern } from "./patterns/edgeShot";
import { ContentRegistry } from "./registry";
import { screenClearUltimate } from "./ultimates/screenClear";

export const createDefaultRegistry = (config: GameConfig): ContentRegistry => {
  const registry = new ContentRegistry();

  registry.registerCharacter(defaultCharacter);
  registry.registerUltimate(screenClearUltimate);
  registry.registerBulletPattern(edgeShotPattern);

  for (const itemDef of createDefaultItems(config)) {
    registry.registerItem(itemDef);
  }

  return registry;
};
