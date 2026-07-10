import type { SkillId } from '../src/game/skills/data';
import type { Pipe } from '../src/game/types';

export type RoomPhase = 'waiting' | 'ready-check' | 'countdown' | 'playing' | 'ended';

export interface PlayerColor {
  body: string;
  wing: string;
  glow: string;
}

export interface SnapshotPlayer {
  id: string;
  name: string;
  color: PlayerColor;
  y: number;
  vy: number;
  alive: boolean;
  invulnerable: boolean;
  ready: boolean;
  equippedOrder: SkillId[];
  charges: Partial<Record<SkillId, number>>;
  activeTimer: Partial<Record<SkillId, number>>;
  clone: { y: number; alive: boolean } | null;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  timestamp: number;
}

// --- Client -> Server ---
export type ClientMessage =
  | { type: 'join'; name: string; color: PlayerColor; equippedOrder: SkillId[] }
  | { type: 'rename'; name: string }
  | { type: 'ready'; ready: boolean }
  | { type: 'jump' }
  | { type: 'skillActivate'; slot: number }
  | { type: 'skillHoverStart'; slot: number }
  | { type: 'skillHoverStop'; slot: number }
  | { type: 'leaderboardRequest' };

// --- Server -> Client ---
export type ServerMessage =
  | { type: 'joined'; id: string }
  | {
      type: 'snapshot';
      phase: RoomPhase;
      countdownEndsAt: number | null;
      score: number;
      pipes: Pipe[];
      players: SnapshotPlayer[];
      you: string;
      leaderboard?: LeaderboardEntry[];
    }
  | { type: 'leaderboard'; entries: LeaderboardEntry[] };

// Matches single-player's ~60Hz requestAnimationFrame-driven physics step — both apply
// fixed per-step increments (gravity, pipe speed, spawn cadence in ticks) rather than
// scaling by elapsed time, so a lower tick rate here would make the whole match visibly
// run in slow motion relative to single-player.
export const TICK_RATE_HZ = 60;
export const TICK_MS = 1000 / TICK_RATE_HZ;
export const READY_COUNTDOWN_MS = 3000;
export const RESPAWN_DELAY_MS = 5000;
export const INVULNERABILITY_MS = 3000;
export const HOVER_SAFETY_TIMEOUT_MS = 2000;
