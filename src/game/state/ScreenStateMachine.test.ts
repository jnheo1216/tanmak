import { describe, expect, it } from "vitest";

import { togglePauseState } from "./ScreenStateMachine";

describe("togglePauseState", () => {
  it("pauses COUNTDOWN and resumes back to COUNTDOWN", () => {
    const paused = togglePauseState("COUNTDOWN", null);
    expect(paused.nextState).toBe("PAUSED");
    expect(paused.pausedFrom).toBe("COUNTDOWN");

    const resumed = togglePauseState(paused.nextState, paused.pausedFrom);
    expect(resumed.nextState).toBe("COUNTDOWN");
    expect(resumed.pausedFrom).toBeNull();
  });

  it("ignores pause toggle on TITLE", () => {
    const result = togglePauseState("TITLE", null);
    expect(result.nextState).toBe("TITLE");
    expect(result.pausedFrom).toBeNull();
  });
});
