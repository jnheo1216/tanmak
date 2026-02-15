import type { GameConfig } from "../config/gameConfig";
import type { ContentRegistry } from "../content/registry";
import type { ItemDefinition } from "../content/types";
import type { EngineState } from "../engine/engineState";
import type { Rng } from "../utils/rng";

interface ItemSpawnParams {
  state: EngineState;
  config: GameConfig;
  registry: ContentRegistry;
  rng: Rng;
  nextEntityId: () => string;
  dtMs: number;
}

export const pickWeightedItem = (
  defs: ItemDefinition[],
  state: EngineState,
  rng: Rng
): ItemDefinition | null => {
  if (defs.length === 0) {
    return null;
  }

  const hpRatio = state.player.hp / state.player.maxHp;
  const gaugeRatio = state.player.ultimateGauge / state.player.ultimateGaugeMax;
  const weights = defs.map((def) => def.weight({ hpRatio, gaugeRatio }));
  const index = rng.pickIndex(weights);
  const picked = defs[index];
  if (picked) {
    return picked;
  }
  return defs[0] ?? null;
};

export const updateItemSpawning = ({
  state,
  config,
  registry,
  rng,
  nextEntityId,
  dtMs
}: ItemSpawnParams): void => {
  state.itemSpawnTimerMs -= dtMs;

  while (state.itemSpawnTimerMs <= 0) {
    state.itemSpawnTimerMs += config.items.spawnIntervalMs;

    if (state.items.length >= config.items.maxConcurrent) {
      continue;
    }

    const defs = registry.getItems();
    const selected = pickWeightedItem(defs, state, rng);
    if (!selected) {
      return;
    }

    const spawnPadding = 24;
    const x = rng.nextBetween(spawnPadding, config.world.width - spawnPadding);
    const y = rng.nextBetween(spawnPadding, config.world.height - spawnPadding);

    const angle = rng.nextBetween(0, Math.PI * 2);
    const speed = config.items.driftSpeed;

    state.items.push({
      id: nextEntityId(),
      alive: true,
      radius: config.items.radius,
      position: { x, y },
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      },
      kind: selected.kind,
      definitionId: selected.id
    });
  }
};

export const clampGauge = (value: number, max: number): number => {
  if (value < 0) {
    return 0;
  }
  if (value > max) {
    return max;
  }
  return value;
};
