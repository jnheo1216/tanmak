interface GameOverScreenProps {
  score: number;
  bestScore: number;
  onRestart: () => void;
  onBackToTitle: () => void;
}

export const GameOverScreen = ({
  score,
  bestScore,
  onRestart,
  onBackToTitle
}: GameOverScreenProps): JSX.Element => {
  return (
    <div className="overlay-card">
      <h2>Game Over</h2>
      <p>최종 점수: {score}</p>
      <p className="muted">최고 점수: {bestScore}</p>
      <div className="actions-row">
        <button type="button" onClick={onRestart}>
          재시작
        </button>
        <button type="button" className="secondary" onClick={onBackToTitle}>
          타이틀로
        </button>
      </div>
    </div>
  );
};
