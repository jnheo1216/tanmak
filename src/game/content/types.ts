import type { BulletBehavior, DifficultyTier, ItemKind, Vector2 } from "../entities/types";

export interface CharacterDefinition {
  id: string;
  radius: number;
  moveSpeed: number;
  maxHp: number;
  ultimateId: string;
}

export interface UltimateStateView {
  gauge: number;
  maxGauge: number;
}

export interface UltimateActivationContext {
  clearBullets: () => number;
}

export interface UltimateDefinition {
  id: string;
  gaugeCost: number;
  canActivate: (state: UltimateStateView) => boolean;
  activate: (ctx: UltimateActivationContext) => void;
}

export interface BulletSpawn {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  damage: number;
  behavior?: BulletBehavior;
}

export interface BulletSpawnContext {
  world: {
    width: number;
    height: number;
  };
  playerPosition: Vector2;
  bulletSpeed: number;
  bulletRadius: number;
  bulletDamage: number;
  angleJitterRad: number;
  rng: {
    next: () => number;
    nextBetween: (min: number, max: number) => number;
  };
}

export interface BulletPatternDefinition {
  id: string;
  spawn: (ctx: BulletSpawnContext, difficulty: DifficultyTier) => BulletSpawn[];
}

export interface ItemEffectContext {
  addScore: (amount: number) => void;
  addGauge: (amount: number) => void;
  heal: (amount: number) => void;
}

export interface ItemWeightState {
  hpRatio: number;
  gaugeRatio: number;
}

export interface ItemDefinition {
  id: string;
  kind: ItemKind;
  apply: (ctx: ItemEffectContext) => void;
  weight: (state: ItemWeightState) => number;
}
