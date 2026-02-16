import type {
  BarrierEntity,
  BulletEntity,
  EquipmentState,
  ItemEntity,
  PlayerEntity,
  ScreenState,
  Vector2
} from "../entities/types";

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
  barrierSpawnCooldownMs: number;
  activePatternId: string;
  activeCharacterId: string;
  player: PlayerEntity;
  equipment: EquipmentState;
  bullets: BulletEntity[];
  items: ItemEntity[];
  barriers: BarrierEntity[];
  ultimateFx: UltimateFxState;
}
