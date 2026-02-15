import type { UltimateDefinition } from "../types";

export const screenClearUltimate: UltimateDefinition = {
  id: "screen-clear",
  gaugeCost: 100,
  canActivate: (state) => state.gauge >= state.maxGauge,
  activate: (ctx) => {
    ctx.clearBullets();
  }
};
