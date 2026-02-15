import { describe, expect, it } from "vitest";

import { pickDifficultyTier } from "./DifficultySystem";

const tiers = [
  { fromSec: 0, toSec: 30, bulletSpeed: 120, spawnIntervalMs: 800, maxBullets: 8 },
  { fromSec: 30, toSec: 90, bulletSpeed: 170, spawnIntervalMs: 500, maxBullets: 16 },
  { fromSec: 90, bulletSpeed: 240, spawnIntervalMs: 300, maxBullets: 28 }
];

describe("pickDifficultyTier", () => {
  it("returns first tier in early game", () => {
    const tier = pickDifficultyTier(10, tiers);
    expect(tier.bulletSpeed).toBe(120);
  });

  it("returns second tier in mid game", () => {
    const tier = pickDifficultyTier(55, tiers);
    expect(tier.spawnIntervalMs).toBe(500);
  });

  it("returns final tier when over top bound", () => {
    const tier = pickDifficultyTier(140, tiers);
    expect(tier.maxBullets).toBe(28);
  });
});
