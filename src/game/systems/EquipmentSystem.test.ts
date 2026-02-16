import { describe, expect, it } from "vitest";

import { gameConfig } from "../config/gameConfig";
import type { EngineState } from "../engine/engineState";
import {
  applyMagnetAttraction,
  resolveBarrierBulletCollisions,
  updateBarrierGenerator,
  upgradeEquipmentLevel
} from "./EquipmentSystem";

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
    position: { x: 300, y: 200 },
    radius: 10,
    moveSpeed: 240,
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
  bullets: [],
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
    origin: { x: 300, y: 200 },
    clearedBullets: 0
  }
});

describe("upgradeEquipmentLevel", () => {
  it("levels up magnet and reports max state", () => {
    const state = createState();

    const leveled = upgradeEquipmentLevel(state, "magnet", gameConfig);
    expect(leveled.leveledUp).toBe(true);
    expect(leveled.reachedMax).toBe(false);
    expect(state.equipment.magnetLevel).toBe(1);

    state.equipment.magnetLevel = state.equipment.maxLevel;
    const duplicate = upgradeEquipmentLevel(state, "magnet", gameConfig);
    expect(duplicate.leveledUp).toBe(false);
    expect(duplicate.reachedMax).toBe(true);
  });
});

describe("applyMagnetAttraction", () => {
  it("does nothing at level 0", () => {
    const state = createState();
    state.items.push({
      id: "item-1",
      alive: true,
      position: { x: 260, y: 200 },
      radius: 8,
      velocity: { x: 0, y: 0 },
      kind: "score",
      definitionId: "item-score"
    });

    applyMagnetAttraction(state, gameConfig, 1);
    expect(state.items[0]?.velocity.x ?? 0).toBe(0);
    expect(state.items[0]?.velocity.y ?? 0).toBe(0);
  });

  it("attracts farther items at higher level", () => {
    const state = createState();
    state.items.push({
      id: "item-near",
      alive: true,
      position: { x: 80, y: 200 },
      radius: 8,
      velocity: { x: 0, y: 0 },
      kind: "score",
      definitionId: "item-score"
    });

    state.equipment.magnetLevel = 1;
    applyMagnetAttraction(state, gameConfig, 0.5);
    const level1Velocity = state.items[0]?.velocity.x ?? 0;
    expect(level1Velocity).toBe(0);

    state.equipment.magnetLevel = 5;
    applyMagnetAttraction(state, gameConfig, 0.5);
    const level5Velocity = state.items[0]?.velocity.x ?? 0;
    expect(level5Velocity).toBeGreaterThan(0);
  });
});

describe("updateBarrierGenerator", () => {
  it("spawns barriers by interval and respects max count", () => {
    const state = createState();
    state.equipment.barrierGeneratorLevel = 5;
    state.barrierSpawnCooldownMs = 10;

    let idCounter = 0;
    updateBarrierGenerator(state, gameConfig, 10000, () => {
      idCounter += 1;
      return `barrier-${idCounter}`;
    });

    expect(state.barriers.length).toBe(3);

    updateBarrierGenerator(state, gameConfig, 10000, () => {
      idCounter += 1;
      return `barrier-${idCounter}`;
    });
    expect(state.barriers.length).toBe(3);
  });
});

describe("resolveBarrierBulletCollisions", () => {
  it("removes both barrier and bullet on collision", () => {
    const state = createState();
    state.barriers.push({
      id: "barrier-1",
      alive: true,
      position: { x: 220, y: 220 },
      radius: 10,
      orbitAngleRad: 0,
      orbitDistance: 34
    });
    state.bullets.push({
      id: "bullet-1",
      alive: true,
      position: { x: 225, y: 220 },
      radius: 6,
      velocity: { x: 0, y: 0 },
      damage: 12,
      ageMs: 0
    });

    resolveBarrierBulletCollisions(state);

    expect(state.barriers).toHaveLength(0);
    expect(state.bullets).toHaveLength(0);
  });
});
