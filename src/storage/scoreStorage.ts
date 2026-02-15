const BEST_SCORE_KEY = "gamm-best-score";

export const loadBestScore = (): number => {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(BEST_SCORE_KEY);
  if (!raw) {
    return 0;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
};

export const saveBestScore = (score: number): number => {
  const next = Math.max(0, Math.floor(score));

  if (typeof window !== "undefined") {
    window.localStorage.setItem(BEST_SCORE_KEY, String(next));
  }

  return next;
};
