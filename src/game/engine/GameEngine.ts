import { gameConfig, type GameConfig } from "../config/gameConfig";
import { createDefaultRegistry } from "../content/defaultContent";
import { ContentRegistry } from "../content/registry";
import type { ItemEffectContext } from "../content/types";
import type { GameSnapshot, InputSnapshot, PlayerEntity } from "../entities/types";
import { CanvasRenderer } from "../render/CanvasRenderer";
import { loadBestScore, saveBestScore } from "../../storage/scoreStorage";
import type { EngineState, UltimateFxState } from "./engineState";
import { togglePauseState } from "../state/ScreenStateMachine";
import { Rng } from "../utils/rng";
import { collectTouchedItems, resolveBulletCollisions } from "../systems/CollisionSystem";
import { pickDifficultyTier } from "../systems/DifficultySystem";
import { clampGauge, updateItemSpawning } from "../systems/ItemSystem";
import {
  cullOutOfBoundsBullets,
  cullOutOfBoundsItems,
  updateBulletMovement,
  updateItemMovement,
  updatePlayerMovement
} from "../systems/MovementSystem";
import { updateBulletSpawning } from "../systems/SpawnSystem";
import { tryActivateUltimate } from "../systems/UltimateSystem";

export interface GameEngine {
  startRun(seed?: number): void;
  update(dtMs: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  handleInput(input: InputSnapshot): void;
  pause(): void;
  resume(): void;
  reset(): void;
  getSnapshot(): GameSnapshot;
}

const defaultInput: InputSnapshot = {
  moveX: 0,
  moveY: 0,
  ultimatePressed: false,
  pausePressed: false
};

export class BulletHellGameEngine implements GameEngine {
  private readonly config: GameConfig;
  private readonly registry: ContentRegistry;
  private readonly renderer: CanvasRenderer;

  private state: EngineState;
  private input: InputSnapshot = defaultInput;
  private rng: Rng;
  private entityIdCounter = 0;

  constructor(config: GameConfig = gameConfig) {
    this.config = config;
    this.registry = createDefaultRegistry(config);
    this.renderer = new CanvasRenderer(config);
    this.rng = new Rng();
    this.state = this.createInitialState(loadBestScore());
  }

  startRun(seed = Date.now()): void {
    this.rng = new Rng(seed);
    this.entityIdCounter = 0;

    const bestScore = this.state.bestScore;
    this.state = this.createRunState(bestScore);
  }

  update(dtMs: number): void {
    this.state.nowMs += dtMs;

    if (this.input.pausePressed) {
      const result = togglePauseState(this.state.screenState, this.state.pausedFrom);
      this.state.screenState = result.nextState;
      this.state.pausedFrom = result.pausedFrom;
    }

    if (this.state.screenState === "TITLE" || this.state.screenState === "GAME_OVER") {
      return;
    }

    if (this.state.screenState === "PAUSED") {
      return;
    }

    if (this.state.screenState === "COUNTDOWN") {
      this.state.countdownMsRemaining = Math.max(0, this.state.countdownMsRemaining - dtMs);
      if (this.state.countdownMsRemaining === 0) {
        this.state.screenState = "PLAYING";
      }
      return;
    }

    this.updatePlaying(dtMs);
  }

  render(ctx: CanvasRenderingContext2D): void {
    this.renderer.render(ctx, this.state);
  }

  handleInput(input: InputSnapshot): void {
    this.input = input;
  }

  pause(): void {
    const result = togglePauseState(this.state.screenState, this.state.pausedFrom);
    if (result.nextState === "PAUSED") {
      this.state.screenState = result.nextState;
      this.state.pausedFrom = result.pausedFrom;
    }
  }

  resume(): void {
    if (this.state.screenState !== "PAUSED") {
      return;
    }
    const result = togglePauseState(this.state.screenState, this.state.pausedFrom);
    this.state.screenState = result.nextState;
    this.state.pausedFrom = result.pausedFrom;
  }

  reset(): void {
    const best = this.state.bestScore;
    this.state = this.createInitialState(best);
    this.input = defaultInput;
  }

  getSnapshot(): GameSnapshot {
    return {
      screenState: this.state.screenState,
      countdownSec: this.state.screenState === "COUNTDOWN" ? Math.max(1, Math.ceil(this.state.countdownMsRemaining / 1000)) : 0,
      score: Math.floor(this.state.score),
      bestScore: this.state.bestScore,
      hp: Math.ceil(this.state.player.hp),
      maxHp: this.state.player.maxHp,
      ultimateGauge: Math.floor(this.state.player.ultimateGauge),
      ultimateReady: this.state.player.ultimateGauge >= this.state.player.ultimateGaugeMax,
      elapsedSec: this.state.elapsedMs / 1000,
      isPaused: this.state.screenState === "PAUSED"
    };
  }

  private updatePlaying(dtMs: number): void {
    const dtSec = dtMs / 1000;
    this.state.elapsedMs += dtMs;
    this.state.score += this.config.score.pointsPerSecond * dtSec;
    this.updateUltimateFx(dtMs);

    const difficulty = pickDifficultyTier(this.state.elapsedMs / 1000, this.config.difficultyTiers);

    updatePlayerMovement(this.state.player, this.input, dtSec, this.config.world);

    if (this.input.ultimatePressed) {
      const bulletsBeforeCast = this.state.bullets.length;
      const ultimate = this.registry.getUltimate(this.state.player.ultimateId);
      const activated = tryActivateUltimate(this.state, ultimate);
      if (activated) {
        const clearedBullets = Math.max(0, bulletsBeforeCast - this.state.bullets.length);
        this.triggerUltimateFx(clearedBullets);
      }
    }

    const pattern = this.registry.getBulletPattern(this.state.activePatternId);
    updateBulletSpawning({
      state: this.state,
      config: this.config,
      difficulty,
      pattern,
      rng: this.rng,
      nextEntityId: this.nextEntityId,
      dtMs
    });

    updateItemSpawning({
      state: this.state,
      config: this.config,
      registry: this.registry,
      rng: this.rng,
      nextEntityId: this.nextEntityId,
      dtMs
    });

    updateBulletMovement(this.state.bullets, dtSec);
    updateItemMovement(this.state.items, dtSec);

    this.state.bullets = cullOutOfBoundsBullets(
      this.state.bullets,
      this.config.world,
      this.config.combat.bulletDespawnMargin
    );
    this.state.items = cullOutOfBoundsItems(this.state.items, this.config.world, this.config.combat.bulletDespawnMargin);

    resolveBulletCollisions(this.state, this.config.player.invulnerabilityMs);

    const collectedItems = collectTouchedItems(this.state);
    for (const item of collectedItems) {
      const itemDef = this.registry.getItem(item.definitionId);
      itemDef.apply(this.createItemEffectContext());
    }

    if (this.state.player.hp <= 0) {
      this.state.player.hp = 0;
      this.state.screenState = "GAME_OVER";
      this.state.pausedFrom = null;
      this.state.bestScore = saveBestScore(Math.max(this.state.bestScore, Math.floor(this.state.score)));
    }
  }

  private createItemEffectContext(): ItemEffectContext {
    return {
      addScore: (amount: number) => {
        this.state.score += amount;
      },
      addGauge: (amount: number) => {
        this.state.player.ultimateGauge = clampGauge(
          this.state.player.ultimateGauge + amount,
          this.state.player.ultimateGaugeMax
        );
      },
      heal: (amount: number) => {
        this.state.player.hp = Math.min(this.state.player.maxHp, this.state.player.hp + amount);
      }
    };
  }

  private createInitialState(bestScore: number): EngineState {
    const player = this.createPlayer();

    return {
      screenState: "TITLE",
      pausedFrom: null,
      countdownMsRemaining: this.config.countdownMs,
      elapsedMs: 0,
      score: 0,
      bestScore,
      nowMs: 0,
      bulletSpawnTimerMs: this.config.difficultyTiers[0]?.spawnIntervalMs ?? 800,
      itemSpawnTimerMs: this.config.items.spawnIntervalMs,
      activePatternId: "edge-shot",
      activeCharacterId: player.characterId,
      player,
      bullets: [],
      items: [],
      ultimateFx: this.createUltimateFxState()
    };
  }

  private createRunState(bestScore: number): EngineState {
    const player = this.createPlayer();

    return {
      screenState: "COUNTDOWN",
      pausedFrom: null,
      countdownMsRemaining: this.config.countdownMs,
      elapsedMs: 0,
      score: 0,
      bestScore,
      nowMs: 0,
      bulletSpawnTimerMs: this.config.difficultyTiers[0]?.spawnIntervalMs ?? 800,
      itemSpawnTimerMs: this.config.items.spawnIntervalMs,
      activePatternId: "edge-shot",
      activeCharacterId: player.characterId,
      player,
      bullets: [],
      items: [],
      ultimateFx: this.createUltimateFxState()
    };
  }

  private createPlayer(): PlayerEntity {
    const character = this.registry.getCharacter("default-runner");

    return {
      id: this.nextEntityId(),
      alive: true,
      characterId: character.id,
      ultimateId: character.ultimateId,
      position: {
        x: this.config.player.startX,
        y: this.config.player.startY
      },
      radius: character.radius,
      moveSpeed: character.moveSpeed,
      hp: character.maxHp,
      maxHp: character.maxHp,
      invulnerableUntilMs: 0,
      ultimateGauge: this.config.ultimate.maxGauge,
      ultimateGaugeMax: this.config.ultimate.maxGauge
    };
  }

  private readonly nextEntityId = (): string => {
    this.entityIdCounter += 1;
    return `entity-${this.entityIdCounter}`;
  };

  private createUltimateFxState(): UltimateFxState {
    return {
      active: false,
      elapsedMs: 0,
      durationMs: 700,
      flashDurationMs: 190,
      shakeDurationMs: 280,
      maxShakePx: 10,
      ringMaxRadius: Math.hypot(this.config.world.width, this.config.world.height),
      origin: {
        x: this.config.world.width / 2,
        y: this.config.world.height / 2
      },
      clearedBullets: 0
    };
  }

  private triggerUltimateFx(clearedBullets: number): void {
    const intensity = Math.min(1, clearedBullets / 20);

    this.state.ultimateFx = {
      active: true,
      elapsedMs: 0,
      durationMs: 700 + intensity * 160,
      flashDurationMs: 190 + intensity * 70,
      shakeDurationMs: 280 + intensity * 120,
      maxShakePx: 10 + intensity * 8,
      ringMaxRadius: Math.hypot(this.config.world.width, this.config.world.height) * (0.9 + intensity * 0.25),
      origin: {
        x: this.state.player.position.x,
        y: this.state.player.position.y
      },
      clearedBullets
    };
  }

  private updateUltimateFx(dtMs: number): void {
    if (!this.state.ultimateFx.active) {
      return;
    }

    this.state.ultimateFx.elapsedMs = Math.min(
      this.state.ultimateFx.durationMs,
      this.state.ultimateFx.elapsedMs + dtMs
    );

    if (this.state.ultimateFx.elapsedMs >= this.state.ultimateFx.durationMs) {
      this.state.ultimateFx.active = false;
    }
  }
}
