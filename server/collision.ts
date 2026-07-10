import { GAP, PIPE_W } from '../src/game/constants';
import type { Pipe } from '../src/game/types';

export interface CollidableLike {
  x: number;
  y: number;
  r: number;
}

/** Standalone reimplementation of the client's update.ts collides() — kept in sync manually. */
export function collides(b: CollidableLike, p: Pipe): boolean {
  const br = b.r - 4;
  if (p.sinking) return false;
  if (b.x + br > p.x && b.x - br < p.x + PIPE_W) {
    if (b.y - br < p.topH || b.y + br > p.topH + GAP) return true;
  }
  return false;
}
