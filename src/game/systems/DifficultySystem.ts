import type { DifficultyTier } from "../entities/types";

export const pickDifficultyTier = (elapsedSec: number, tiers: DifficultyTier[]): DifficultyTier => {
  if (tiers.length === 0) {
    throw new Error("difficultyTiers must contain at least one tier");
  }

  const exact = tiers.find((tier) => {
    const lowerOk = elapsedSec >= tier.fromSec;
    const upperOk = tier.toSec === undefined || elapsedSec < tier.toSec;
    return lowerOk && upperOk;
  });

  const fallback = tiers[tiers.length - 1];
  if (!fallback) {
    throw new Error("difficulty tier fallback was not found");
  }

  return exact ?? fallback;
};
