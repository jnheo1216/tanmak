const BEST_SCORE_KEY = "tanmak-best-score";
const LEGACY_BEST_SCORE_KEY = "gamm-best-score";

const parseScore = (raw: string | null): number | null => {
  if (!raw) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
};

export const loadBestScore = (): number => {
  if (typeof window === "undefined") {
    return 0;
  }

  const current = parseScore(window.localStorage.getItem(BEST_SCORE_KEY));
  if (current !== null) {
    return current;
  }

  const legacy = parseScore(window.localStorage.getItem(LEGACY_BEST_SCORE_KEY));
  if (legacy === null) {
    return 0;
  }

  window.localStorage.setItem(BEST_SCORE_KEY, String(legacy));
  return legacy;
};

export const saveBestScore = (score: number): number => {
  const next = Math.max(0, Math.floor(score));

  if (typeof window !== "undefined") {
    window.localStorage.setItem(BEST_SCORE_KEY, String(next));
  }

  return next;
};
