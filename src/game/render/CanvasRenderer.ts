import type { GameConfig } from "../config/gameConfig";
import type { EngineState } from "../engine/engineState";

export class CanvasRenderer {
  constructor(private readonly config: GameConfig) {}

  render(ctx: CanvasRenderingContext2D, state: EngineState): void {
    const { width, height } = this.config.world;
    const fx = state.ultimateFx;
    const fxElapsed = fx.active ? fx.elapsedMs : fx.durationMs;
    const shakeOffset = this.calculateShakeOffset(state.nowMs, fxElapsed, fx.shakeDurationMs, fx.maxShakePx);

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#061220");
    background.addColorStop(0.5, "#0a1f33");
    background.addColorStop(1, "#07111f");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(90, 125, 170, 0.25)";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#1b2f52";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    for (const bullet of state.bullets) {
      const splitter = bullet.behavior?.type === "split-on-timeout";
      const spiralEmitter = bullet.behavior?.type === "spiral-emitter";
      ctx.beginPath();
      ctx.fillStyle = spiralEmitter ? "#76e0ff" : splitter ? "#ffb366" : "#ff6b6b";
      ctx.arc(bullet.position.x, bullet.position.y, bullet.radius, 0, Math.PI * 2);
      ctx.fill();

      if (splitter) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255, 238, 194, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.arc(bullet.position.x, bullet.position.y, bullet.radius + 2.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (spiralEmitter) {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(198, 247, 255, 0.9)";
        ctx.lineWidth = 1.6;
        ctx.arc(bullet.position.x, bullet.position.y, bullet.radius + 3.2, 0, Math.PI * 2);
        ctx.stroke();

        const markAngle = (bullet.ageMs / 1000) * 7;
        const markX = bullet.position.x + Math.cos(markAngle) * (bullet.radius + 1.8);
        const markY = bullet.position.y + Math.sin(markAngle) * (bullet.radius + 1.8);
        ctx.beginPath();
        ctx.fillStyle = "rgba(235, 255, 255, 0.95)";
        ctx.arc(markX, markY, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const item of state.items) {
      const color =
        item.kind === "score" ? "#ffd166" : item.kind === "gauge" ? "#00d1ff" : "#7dff9b";
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(item.position.x, item.position.y, item.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    const playerBlinking =
      state.nowMs < state.player.invulnerableUntilMs && Math.floor(state.nowMs / 80) % 2 === 0;

    ctx.beginPath();
    ctx.fillStyle = playerBlinking ? "#ffffff" : "#00d1b2";
    ctx.arc(state.player.position.x, state.player.position.y, state.player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.arc(state.player.position.x, state.player.position.y, state.player.radius + 5, 0, Math.PI * 2);
    ctx.stroke();

    this.renderUltimateWave(ctx, state);
    ctx.restore();

    this.renderUltimateFlash(ctx, width, height, fxElapsed, fx.flashDurationMs);
  }

  private calculateShakeOffset(
    nowMs: number,
    elapsedMs: number,
    shakeDurationMs: number,
    maxShakePx: number
  ): { x: number; y: number } {
    if (elapsedMs >= shakeDurationMs || shakeDurationMs <= 0 || maxShakePx <= 0) {
      return { x: 0, y: 0 };
    }

    const t = elapsedMs / shakeDurationMs;
    const strength = (1 - t) * maxShakePx;
    const x = Math.sin(nowMs * 0.11) * strength;
    const y = Math.cos(nowMs * 0.09) * strength;
    return { x, y };
  }

  private renderUltimateWave(ctx: CanvasRenderingContext2D, state: EngineState): void {
    const fx = state.ultimateFx;
    if (!fx.active || fx.durationMs <= 0) {
      return;
    }

    const progress = Math.min(1, fx.elapsedMs / fx.durationMs);
    const fade = 1 - progress;
    const primaryRadius = 20 + fx.ringMaxRadius * progress;
    const secondaryRadius = 10 + fx.ringMaxRadius * Math.min(1, progress * 1.25);
    const burstAlpha = Math.max(0, 0.55 * (1 - fx.elapsedMs / Math.max(1, fx.flashDurationMs * 1.2)));
    const clearedBonus = Math.min(1, fx.clearedBullets / 20);

    const burst = ctx.createRadialGradient(
      fx.origin.x,
      fx.origin.y,
      0,
      fx.origin.x,
      fx.origin.y,
      110 + 70 * clearedBonus
    );
    burst.addColorStop(0, `rgba(206, 245, 255, ${burstAlpha})`);
    burst.addColorStop(0.45, `rgba(120, 220, 255, ${burstAlpha * 0.45})`);
    burst.addColorStop(1, "rgba(120, 220, 255, 0)");
    ctx.fillStyle = burst;
    ctx.beginPath();
    ctx.arc(fx.origin.x, fx.origin.y, 110 + 70 * clearedBonus, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 10 - 6 * progress;
    ctx.strokeStyle = `rgba(173, 240, 255, ${0.85 * fade})`;
    ctx.beginPath();
    ctx.arc(fx.origin.x, fx.origin.y, primaryRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 5 - 3 * progress;
    ctx.strokeStyle = `rgba(105, 200, 255, ${0.75 * fade})`;
    ctx.beginPath();
    ctx.arc(fx.origin.x, fx.origin.y, secondaryRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  private renderUltimateFlash(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    elapsedMs: number,
    flashDurationMs: number
  ): void {
    if (elapsedMs >= flashDurationMs || flashDurationMs <= 0) {
      return;
    }

    const progress = elapsedMs / flashDurationMs;
    const alpha = 0.62 * (1 - progress);
    ctx.fillStyle = `rgba(225, 248, 255, ${alpha})`;
    ctx.fillRect(0, 0, width, height);
  }
}
