interface TitleScreenProps {
  bestScore: number;
  onStart: () => void;
}

export const TitleScreen = ({ bestScore, onStart }: TitleScreenProps): JSX.Element => {
  return (
    <div className="overlay-card">
      <img className="brand-logo" src="/logo.svg" alt="TANMAK 로고" />
      <h1>탄막 피하기</h1>
      <p className="brand-tagline">TANMAK · Infinite Bullet Survival</p>
      <p>사방에서 날아오는 알갱이를 피하며 점수를 올리세요.</p>
      <p className="muted">조작: 방향키 이동 / Z 궁극기 / X 일시정지</p>
      <p className="muted">최고 점수: {bestScore}</p>
      <button type="button" onClick={onStart}>
        게임 시작
      </button>
    </div>
  );
};
