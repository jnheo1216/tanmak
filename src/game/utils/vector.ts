import type { Vector2 } from "../entities/types";

export const vec = (x = 0, y = 0): Vector2 => ({ x, y });

export const add = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x + b.x, y: a.y + b.y });

export const scale = (v: Vector2, s: number): Vector2 => ({ x: v.x * s, y: v.y * s });

export const magnitude = (v: Vector2): number => Math.hypot(v.x, v.y);

export const normalize = (v: Vector2): Vector2 => {
  const length = magnitude(v);
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: v.x / length, y: v.y / length };
};

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const distanceSq = (a: Vector2, b: Vector2): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};
