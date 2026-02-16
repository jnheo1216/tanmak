export type ScreenState = "TITLE" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAME_OVER";

export interface Vector2 {
  x: number;
  y: number;
}

export interface InputSnapshot {
  moveX: number;
  moveY: number;
  ultimatePressed: boolean;
  pausePressed: boolean;
}

export interface GameSnapshot {
  screenState: ScreenState;
  countdownSec: number;
  score: number;
  bestScore: number;
  hp: number;
  maxHp: number;
  ultimateGauge: number;
  ultimateReady: boolean;
  elapsedSec: number;
  isPaused: boolean;
  equipmentMagnetLevel: number;
  equipmentMagnetRange: number;
  equipmentBarrierLevel: number;
  equipmentBarrierCount: number;
  equipmentBarrierMax: number;
  equipmentBarrierCooldownSec: number;
}

export interface BaseEntity {
  id: string;
  position: Vector2;
  radius: number;
  alive: boolean;
}

export interface PlayerEntity extends BaseEntity {
  moveSpeed: number;
  hp: number;
  maxHp: number;
  invulnerableUntilMs: number;
  ultimateGauge: number;
  ultimateGaugeMax: number;
  characterId: string;
  ultimateId: string;
}

export interface SplitOnTimeoutBehavior {
  type: "split-on-timeout";
  triggerAfterMs: number;
  fragmentCount: number;
  fragmentSpeedMultiplier: number;
  fragmentRadiusMultiplier: number;
  fragmentDamageMultiplier: number;
  startAngleRad: number;
}

export interface SpiralEmitterBehavior {
  type: "spiral-emitter";
  emitIntervalMs: number;
  nextEmitAtMs: number;
  bulletsPerEmission: number;
  turnRateRad: number;
  currentAngleRad: number;
  emitSpeedMultiplier: number;
  emitRadiusMultiplier: number;
  emitDamageMultiplier: number;
}

export type BulletBehavior = SplitOnTimeoutBehavior | SpiralEmitterBehavior;

export interface BulletEntity extends BaseEntity {
  velocity: Vector2;
  damage: number;
  ageMs: number;
  behavior?: BulletBehavior;
}

export type ItemKind = "score" | "gauge" | "heal" | "equip-magnet" | "equip-barrier-generator";

export type EquipmentType = "magnet" | "barrier-generator";

export interface EquipmentState {
  magnetLevel: number;
  barrierGeneratorLevel: number;
  maxLevel: number;
}

export interface ItemEntity extends BaseEntity {
  velocity: Vector2;
  kind: ItemKind;
  definitionId: string;
}

export interface BarrierEntity extends BaseEntity {
  orbitAngleRad: number;
  orbitDistance: number;
}

export interface DifficultyTier {
  fromSec: number;
  toSec?: number;
  bulletSpeed: number;
  spawnIntervalMs: number;
  maxBullets: number;
}
