import type { UltimateDefinition } from "../content/types";
import type { EngineState } from "../engine/engineState";

export const tryActivateUltimate = (state: EngineState, def: UltimateDefinition): boolean => {
  const canActivate = def.canActivate({
    gauge: state.player.ultimateGauge,
    maxGauge: state.player.ultimateGaugeMax
  });

  if (!canActivate) {
    return false;
  }

  if (state.player.ultimateGauge < def.gaugeCost) {
    return false;
  }

  def.activate({
    clearBullets: () => {
      const removed = state.bullets.length;
      state.bullets = [];
      return removed;
    }
  });

  state.player.ultimateGauge = Math.max(0, state.player.ultimateGauge - def.gaugeCost);
  return true;
};
