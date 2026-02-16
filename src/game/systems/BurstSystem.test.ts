import { describe, expect, it } from "vitest";

import type { EngineState } from "../engine/engineState";
import { updateBurstBullets } from "./BurstSystem";

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
  activePatternId: "split-burst-shot",
  activeCharacterId: "default-runner",
  player: {
    id: "player-1",
    alive: true,
    position: { x: 100, y: 100 },
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
  bullets: [
    {
      id: "core-1",
      alive: true,
      position: { x: 80, y: 80 },
      radius: 7,
      velocity: { x: 70, y: 0 },
      damage: 10,
      ageMs: 500,
      behavior: {
        type: "split-on-timeout",
        triggerAfterMs: 520,
        fragmentCount: 8,
        fragmentSpeedMultiplier: 1.1,
        fragmentRadiusMultiplier: 0.8,
        fragmentDamageMultiplier: 0.6,
        startAngleRad: 0
      }
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

describe("updateBurstBullets", () => {
  it("splits a core bullet into radial fragments after timeout", () => {
    const state = createState();
    let idCounter = 0;

    updateBurstBullets({
      state,
      dtMs: 40,
      nextEntityId: () => {
        idCounter += 1;
        return `frag-${idCounter}`;
      },
      maxBullets: 20
    });

    expect(state.bullets).toHaveLength(8);
    expect(state.bullets.every((bullet) => bullet.behavior === undefined)).toBe(true);
    expect(state.bullets.every((bullet) => bullet.ageMs === 0)).toBe(true);
  });

  it("respects max bullet cap while splitting", () => {
    const state = createState();
    state.bullets.push({
      id: "existing",
      alive: true,
      position: { x: 20, y: 20 },
      radius: 5,
      velocity: { x: 0, y: 0 },
      damage: 8,
      ageMs: 0
    });

    let idCounter = 0;
    updateBurstBullets({
      state,
      dtMs: 40,
      nextEntityId: () => {
        idCounter += 1;
        return `frag-${idCounter}`;
      },
      maxBullets: 5
    });

    expect(state.bullets).toHaveLength(5);
  });

  it("emits spiral bullets over time while core keeps moving", () => {
    const state = createState();
    state.activePatternId = "spiral-seeder-shot";
    state.bullets = [
      {
        id: "spiral-core",
        alive: true,
        position: { x: 120, y: 120 },
        radius: 8,
        velocity: { x: 40, y: 0 },
        damage: 8,
        ageMs: 0,
        behavior: {
          type: "spiral-emitter",
          emitIntervalMs: 200,
          nextEmitAtMs: 200,
          bulletsPerEmission: 2,
          turnRateRad: 0.5,
          currentAngleRad: 0,
          emitSpeedMultiplier: 1.1,
          emitRadiusMultiplier: 0.7,
          emitDamageMultiplier: 0.6
        }
      }
    ];

    let idCounter = 0;
    updateBurstBullets({
      state,
      dtMs: 250,
      nextEntityId: () => {
        idCounter += 1;
        return `spiral-${idCounter}`;
      },
      maxBullets: 20
    });

    expect(state.bullets.length).toBeGreaterThan(1);
    expect(state.bullets.some((bullet) => bullet.id === "spiral-core")).toBe(true);
    expect(state.bullets.filter((bullet) => bullet.id !== "spiral-core").every((bullet) => bullet.ageMs === 0)).toBe(true);

    updateBurstBullets({
      state,
      dtMs: 6000,
      nextEntityId: () => {
        idCounter += 1;
        return `spiral-${idCounter}`;
      },
      maxBullets: 20
    });

    expect(state.bullets.some((bullet) => bullet.id === "spiral-core")).toBe(true);
  });
});
