import { describe, expect, it } from "vitest";

import type { UltimateDefinition } from "../content/types";
import type { EngineState } from "../engine/engineState";
import { tryActivateUltimate } from "./UltimateSystem";

const createState = (): EngineState => ({
  screenState: "PLAYING",
  pausedFrom: null,
  countdownMsRemaining: 0,
  elapsedMs: 0,
  score: 0,
  bestScore: 0,
  nowMs: 0,
  bulletSpawnTimerMs: 500,
  itemSpawnTimerMs: 1000,
  barrierSpawnCooldownMs: 0,
  activePatternId: "edge-shot",
  activeCharacterId: "default-runner",
  player: {
    id: "player-1",
    alive: true,
    position: { x: 100, y: 100 },
    radius: 10,
    moveSpeed: 200,
    hp: 100,
    maxHp: 100,
    invulnerableUntilMs: 0,
    ultimateGauge: 100,
    ultimateGaugeMax: 100,
    characterId: "default-runner",
    ultimateId: "screen-clear"
  },
  equipment: {
    magnetLevel: 0,
    barrierGeneratorLevel: 0,
    maxLevel: 5
  },
  bullets: [
    {
      id: "b-1",
      alive: true,
      position: { x: 20, y: 20 },
      radius: 6,
      velocity: { x: 10, y: 10 },
      damage: 12,
      ageMs: 0
    }
  ],
  items: [],
  barriers: [],
  ultimateFx: {
    active: false,
    elapsedMs: 0,
    durationMs: 700,
    flashDurationMs: 190,
    shakeDurationMs: 280,
    maxShakePx: 10,
    ringMaxRadius: 800,
    origin: { x: 100, y: 100 },
    clearedBullets: 0
  }
});

const ultimateDef: UltimateDefinition = {
  id: "screen-clear",
  gaugeCost: 100,
  canActivate: (state) => state.gauge >= state.maxGauge,
  activate: (ctx) => {
    ctx.clearBullets();
  }
};

describe("tryActivateUltimate", () => {
  it("clears bullets and consumes gauge when full", () => {
    const state = createState();

    const activated = tryActivateUltimate(state, ultimateDef);

    expect(activated).toBe(true);
    expect(state.bullets).toHaveLength(0);
    expect(state.player.ultimateGauge).toBe(0);
  });

  it("does not activate if gauge is not full", () => {
    const state = createState();
    state.player.ultimateGauge = 80;

    const activated = tryActivateUltimate(state, ultimateDef);

    expect(activated).toBe(false);
    expect(state.bullets).toHaveLength(1);
    expect(state.player.ultimateGauge).toBe(80);
  });
});
