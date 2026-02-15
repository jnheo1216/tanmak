export class GameLoop {
  private readonly fixedStepMs: number;
  private readonly update: (dtMs: number) => void;
  private readonly render: () => void;

  private animationFrameId: number | null = null;
  private accumulatorMs = 0;
  private previousTimeMs = 0;
  private running = false;

  constructor(update: (dtMs: number) => void, render: () => void, fixedStepMs = 1000 / 60) {
    this.update = update;
    this.render = render;
    this.fixedStepMs = fixedStepMs;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.previousTimeMs = performance.now();
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private readonly tick = (timeMs: number): void => {
    if (!this.running) {
      return;
    }

    let frameMs = timeMs - this.previousTimeMs;
    this.previousTimeMs = timeMs;

    // Avoid spiraling updates after tab backgrounding.
    frameMs = Math.min(frameMs, 100);
    this.accumulatorMs += frameMs;

    while (this.accumulatorMs >= this.fixedStepMs) {
      this.update(this.fixedStepMs);
      this.accumulatorMs -= this.fixedStepMs;
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.tick);
  };
}
