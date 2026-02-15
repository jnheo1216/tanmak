export class Rng {
  private state: number;

  constructor(seed = Date.now()) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state += 0x6d2b79f5;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextBetween(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  pickIndex(weights: number[]): number {
    const sum = weights.reduce((total, weight) => total + Math.max(0, weight), 0);
    if (sum <= 0) {
      return 0;
    }
    const roll = this.nextBetween(0, sum);
    let accumulated = 0;
    for (let i = 0; i < weights.length; i += 1) {
      accumulated += Math.max(0, weights[i] ?? 0);
      if (roll <= accumulated) {
        return i;
      }
    }
    return Math.max(0, weights.length - 1);
  }
}
