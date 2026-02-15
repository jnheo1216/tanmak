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

export interface BulletEntity extends BaseEntity {
  velocity: Vector2;
  damage: number;
}

export type ItemKind = "score" | "gauge" | "heal";

export interface ItemEntity extends BaseEntity {
  velocity: Vector2;
  kind: ItemKind;
  definitionId: string;
}

export interface DifficultyTier {
  fromSec: number;
  toSec?: number;
  bulletSpeed: number;
  spawnIntervalMs: number;
  maxBullets: number;
}
