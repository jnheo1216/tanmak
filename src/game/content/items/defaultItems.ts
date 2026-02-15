import type { GameConfig } from "../../config/gameConfig";
import type { ItemDefinition } from "../types";

export const createDefaultItems = (config: GameConfig): ItemDefinition[] => {
  const scoreItem: ItemDefinition = {
    id: "item-score",
    kind: "score",
    apply: (ctx) => {
      ctx.addScore(config.items.effects.score);
    },
    weight: () => config.items.weights.score
  };

  const gaugeItem: ItemDefinition = {
    id: "item-gauge",
    kind: "gauge",
    apply: (ctx) => {
      ctx.addGauge(config.items.effects.gauge);
    },
    weight: () => config.items.weights.gauge
  };

  const healItem: ItemDefinition = {
    id: "item-heal",
    kind: "heal",
    apply: (ctx) => {
      ctx.heal(config.items.effects.heal);
    },
    weight: (state) => {
      const urgencyBoost = state.hpRatio < 0.4 ? 15 : 0;
      return config.items.weights.heal + urgencyBoost;
    }
  };

  return [scoreItem, gaugeItem, healItem];
};
