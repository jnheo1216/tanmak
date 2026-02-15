import type { InputSnapshot } from "../entities/types";

export interface InputBindings {
  up: string;
  down: string;
  left: string;
  right: string;
  ultimate: string;
  pause: string;
}

export class InputManager {
  private readonly bindings: InputBindings;
  private readonly pressedKeys = new Set<string>();
  private readonly pressedThisFrame = new Set<string>();

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!this.pressedKeys.has(event.code)) {
      this.pressedThisFrame.add(event.code);
    }
    this.pressedKeys.add(event.code);
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code);
  };

  constructor(bindings: InputBindings) {
    this.bindings = bindings;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  sample(): InputSnapshot {
    const horizontal = (this.pressedKeys.has(this.bindings.right) ? 1 : 0) - (this.pressedKeys.has(this.bindings.left) ? 1 : 0);
    const vertical = (this.pressedKeys.has(this.bindings.down) ? 1 : 0) - (this.pressedKeys.has(this.bindings.up) ? 1 : 0);

    const magnitude = Math.hypot(horizontal, vertical);
    const moveX = magnitude > 0 ? horizontal / magnitude : 0;
    const moveY = magnitude > 0 ? vertical / magnitude : 0;

    const snapshot: InputSnapshot = {
      moveX,
      moveY,
      ultimatePressed: this.pressedThisFrame.has(this.bindings.ultimate),
      pausePressed: this.pressedThisFrame.has(this.bindings.pause)
    };

    this.pressedThisFrame.clear();
    return snapshot;
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.pressedKeys.clear();
    this.pressedThisFrame.clear();
  }
}
