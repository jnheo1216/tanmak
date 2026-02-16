import { describe, expect, it } from "vitest";

import type { EngineState } from "../engine/engineState";
import { resolveBulletCollisions } from "./CollisionSystem";

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
    id: "player",
    alive: true,
    position: { x: 100, y: 100 },
    radius: 10,
    moveSpeed: 220,
    hp: 100,
    maxHp: 100,
    invulnerableUntilMs: 0,
    ultimateGauge: 0,
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
      id: "bullet-1",
      alive: true,
      position: { x: 105, y: 100 },
      radius: 6,
      velocity: { x: 0, y: 0 },
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

describe("resolveBulletCollisions", () => {
  it("applies damage and sets invulnerability", () => {
    const state = createState();

    const result = resolveBulletCollisions(state, 300);

    expect(result.tookDamage).toBe(true);
    expect(state.player.hp).toBe(88);
    expect(state.player.invulnerableUntilMs).toBe(300);
    expect(state.bullets).toHaveLength(0);
  });

  it("blocks repeated damage during invulnerability", () => {
    const state = createState();
    state.player.invulnerableUntilMs = 500;
    state.nowMs = 100;

    const result = resolveBulletCollisions(state, 300);

    expect(result.tookDamage).toBe(false);
    expect(state.player.hp).toBe(100);
    expect(state.bullets).toHaveLength(0);
  });
});
