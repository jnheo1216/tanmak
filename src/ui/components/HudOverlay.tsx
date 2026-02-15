import type { GameSnapshot } from "../../game/entities/types";

interface HudOverlayProps {
  snapshot: GameSnapshot;
}

export const HudOverlay = ({ snapshot }: HudOverlayProps): JSX.Element => {
  const hpRatio = snapshot.maxHp > 0 ? snapshot.hp / snapshot.maxHp : 0;
  const gaugeRatio = snapshot.ultimateGauge / 100;

  return (
    <>
      <div className="hud-top">
        <div className="hud-box">
          <div className="hud-label">HP</div>
          <div className="bar-wrap">
            <div className="bar hp" style={{ width: `${Math.max(0, Math.min(1, hpRatio)) * 100}%` }} />
          </div>
          <div className="hud-value">
            {snapshot.hp} / {snapshot.maxHp}
          </div>
        </div>

        <div className="hud-box">
          <div className="hud-label">궁극기</div>
          <div className="bar-wrap">
            <div className="bar gauge" style={{ width: `${Math.max(0, Math.min(1, gaugeRatio)) * 100}%` }} />
          </div>
          <div className="hud-value">{snapshot.ultimateReady ? "READY" : `${snapshot.ultimateGauge}%`}</div>
        </div>

        <div className="hud-box score-box">
          <div className="hud-label">SCORE</div>
          <div className="score">{snapshot.score}</div>
          <div className="hud-value">BEST {snapshot.bestScore}</div>
        </div>
      </div>

      <div className="hud-bottom">방향키 이동 · Z 궁극기 · X 일시정지</div>

      {snapshot.screenState === "COUNTDOWN" ? (
        <div className="center-overlay countdown">{snapshot.countdownSec}</div>
      ) : null}

      {snapshot.isPaused ? <div className="center-overlay paused">PAUSED</div> : null}
    </>
  );
};
