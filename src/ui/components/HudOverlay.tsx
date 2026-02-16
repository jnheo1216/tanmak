import type { GameSnapshot } from "../../game/entities/types";

interface HudOverlayProps {
  snapshot: GameSnapshot;
}

export const HudOverlay = ({ snapshot }: HudOverlayProps): JSX.Element => {
  const hpRatio = snapshot.maxHp > 0 ? snapshot.hp / snapshot.maxHp : 0;
  const gaugeRatio = snapshot.ultimateGauge / 100;
  const barrierCooldownLabel =
    snapshot.equipmentBarrierLevel > 0 ? `${snapshot.equipmentBarrierCooldownSec.toFixed(1)}s` : "-";

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

        <div className="hud-box equipment-box">
          <div className="hud-label">장착 아이템</div>
          <div className="hud-value">자석 Lv {snapshot.equipmentMagnetLevel}</div>
          <div className="hud-value">흡인 범위 {snapshot.equipmentMagnetRange}</div>
          <div className="hud-value">베리어 생성기 Lv {snapshot.equipmentBarrierLevel}</div>
          <div className="hud-value">
            베리어 {snapshot.equipmentBarrierCount}/{snapshot.equipmentBarrierMax}
          </div>
          <div className="hud-value">다음 생성 {barrierCooldownLabel}</div>
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
