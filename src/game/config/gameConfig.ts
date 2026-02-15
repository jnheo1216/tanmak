import type { DifficultyTier, ItemKind } from "../entities/types";

export interface GameConfig {
  world: {
    width: number;
    height: number;
  };
  countdownMs: number;
  controls: {
    up: string;
    down: string;
    left: string;
    right: string;
    ultimate: string;
    pause: string;
  };
  player: {
    radius: number;
    moveSpeed: number;
    maxHp: number;
    invulnerabilityMs: number;
    startX: number;
    startY: number;
  };
  score: {
    pointsPerSecond: number;
  };
  combat: {
    bulletContactDamage: number;
    bulletRadius: number;
    bulletDespawnMargin: number;
    bulletAngleJitterRad: number;
  };
  patterns: {
    primaryId: string;
    splitBurstId: string;
    spiralSeederId: string;
    splitBurstUnlockSec: number;
    spiralSeederUnlockSec: number;
    splitBurstChanceMid: number;
    splitBurstChanceLate: number;
    spiralSeederChanceMid: number;
    spiralSeederChanceLate: number;
    splitBurstLateSec: number;
  };
  ultimate: {
    maxGauge: number;
  };
  items: {
    spawnIntervalMs: number;
    maxConcurrent: number;
    radius: number;
    driftSpeed: number;
    effects: {
      score: number;
      gauge: number;
      heal: number;
    };
    weights: Record<ItemKind, number>;
  };
  difficultyTiers: DifficultyTier[];
}

const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 720;

export const gameConfig: GameConfig = {
  world: {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT
  },
  countdownMs: 3000,
  controls: {
    up: "ArrowUp",
    down: "ArrowDown",
    left: "ArrowLeft",
    right: "ArrowRight",
    ultimate: "KeyZ",
    pause: "KeyX"
  },
  player: {
    radius: 10,
    moveSpeed: 260,
    maxHp: 100,
    invulnerabilityMs: 300,
    startX: WORLD_WIDTH / 2,
    startY: WORLD_HEIGHT / 2
  },
  score: {
    pointsPerSecond: 10
  },
  combat: {
    bulletContactDamage: 12,
    bulletRadius: 6,
    bulletDespawnMargin: 32,
    bulletAngleJitterRad: 0.28
  },
  patterns: {
    primaryId: "edge-shot",
    splitBurstId: "split-burst-shot",
    spiralSeederId: "spiral-seeder-shot",
    splitBurstUnlockSec: 22,
    spiralSeederUnlockSec: 48,
    splitBurstChanceMid: 0.3,
    splitBurstChanceLate: 0.48,
    spiralSeederChanceMid: 0.14,
    spiralSeederChanceLate: 0.26,
    splitBurstLateSec: 65
  },
  ultimate: {
    maxGauge: 100
  },
  items: {
    spawnIntervalMs: 4500,
    maxConcurrent: 2,
    radius: 8,
    driftSpeed: 35,
    effects: {
      score: 250,
      gauge: 35,
      heal: 20
    },
    weights: {
      score: 55,
      gauge: 25,
      heal: 20
    }
  },
  difficultyTiers: [
    {
      fromSec: 0,
      toSec: 30,
      bulletSpeed: 120,
      spawnIntervalMs: 800,
      maxBullets: 8
    },
    {
      fromSec: 30,
      toSec: 90,
      bulletSpeed: 170,
      spawnIntervalMs: 500,
      maxBullets: 16
    },
    {
      fromSec: 90,
      bulletSpeed: 240,
      spawnIntervalMs: 300,
      maxBullets: 28
    }
  ]
};
