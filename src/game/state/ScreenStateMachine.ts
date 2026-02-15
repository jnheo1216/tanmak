import type { ScreenState } from "../entities/types";

export interface PauseTransitionResult {
  nextState: ScreenState;
  pausedFrom: Exclude<ScreenState, "TITLE" | "GAME_OVER" | "PAUSED"> | null;
}

export const togglePauseState = (
  current: ScreenState,
  pausedFrom: Exclude<ScreenState, "TITLE" | "GAME_OVER" | "PAUSED"> | null
): PauseTransitionResult => {
  if (current === "PAUSED") {
    return {
      nextState: pausedFrom ?? "PLAYING",
      pausedFrom: null
    };
  }

  if (current === "COUNTDOWN" || current === "PLAYING") {
    return {
      nextState: "PAUSED",
      pausedFrom: current
    };
  }

  return {
    nextState: current,
    pausedFrom
  };
};
