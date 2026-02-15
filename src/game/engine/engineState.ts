import type { BulletEntity, ItemEntity, PlayerEntity, ScreenState, Vector2 } from "../entities/types";

export interface UltimateFxState {
  active: boolean;
  elapsedMs: number;
  durationMs: number;
  flashDurationMs: number;
  shakeDurationMs: number;
  maxShakePx: number;
  ringMaxRadius: number;
  origin: Vector2;
  clearedBullets: number;
}

export interface EngineState {
  screenState: ScreenState;
  pausedFrom: Exclude<ScreenState, "TITLE" | "GAME_OVER" | "PAUSED"> | null;
  countdownMsRemaining: number;
  elapsedMs: number;
  score: number;
  bestScore: number;
  nowMs: number;
  bulletSpawnTimerMs: number;
  itemSpawnTimerMs: number;
  activePatternId: string;
  activeCharacterId: string;
  player: PlayerEntity;
  bullets: BulletEntity[];
  items: ItemEntity[];
  ultimateFx: UltimateFxState;
}
