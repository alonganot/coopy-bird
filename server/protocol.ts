import type { SkillId } from '../src/game/skills/data';
import type { Pipe } from '../src/game/types';

export type RoomPhase = 'waiting' | 'ready-check' | 'countdown' | 'playing' | 'ended';

export interface PlayerColor {
  body: string;
  wing: string;
  glow: string;
}

/** Wearable prop ids only (not styling data) — the client resolves ids to full items via SHOP_HATS/etc. */
export interface PlayerProps {
  hat: string;
  glasses: string;
  mask: string;
  shoe: string;
}

export interface SnapshotPlayer {
  id: string;
  name: string;
  color: PlayerColor;
  props: PlayerProps;
  y: number;
  vy: number;
  alive: boolean;
  invulnerable: boolean;
  levitating: boolean;
  respawnInMs: number | null;
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
  // `name` is always the joining player's real account username now (no separate,
  // editable lobby nickname) — it's also the stable key multiplayer leaderboard
  // entries are recorded under.
  | { type: 'join'; name: string; color: PlayerColor; props: PlayerProps; equippedOrder: SkillId[] }
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
      // Relative ms remaining, computed server-side each broadcast — like `respawnInMs`, not
      // an absolute epoch timestamp, since comparing an absolute server timestamp against the
      // client's own `Date.now()` breaks under any client/server clock skew (seen in practice
      // on mobile devices with an inaccurate system clock: the countdown reads stuck at 0).
      countdownInMs: number | null;
      score: number;
      pipes: Pipe[];
      players: SnapshotPlayer[];
      you: string;
      leaderboard?: LeaderboardEntry[];
    }
  | { type: 'leaderboard'; entries: LeaderboardEntry[] }
  // Sent to each player individually once, right as their match ends — see `onMatchEnd` in
  // server/index.ts. `totalCoins` is the player's authoritative new balance (server-computed,
  // not a client-side guess), so the client can fold it into its own gameData in place.
  | { type: 'coinsAwarded'; amount: number; totalCoins: number };

// Matches single-player's ~60Hz requestAnimationFrame-driven physics step — both apply
// fixed per-step increments (gravity, pipe speed, spawn cadence in ticks) rather than
// scaling by elapsed time, so a lower tick rate here would make the whole match visibly
// run in slow motion relative to single-player.
export const TICK_RATE_HZ = 60;
export const TICK_MS = 1000 / TICK_RATE_HZ;
export const READY_COUNTDOWN_MS = 3000;
export const RESPAWN_DELAY_MS = 5000;
export const INVULNERABILITY_MS = 3000;
// Slightly under RESPAWN_DELAY_MS, close to INVULNERABILITY_MS — long enough to reorient
// after respawn, short enough nobody can float indefinitely by staying idle.
export const LEVITATE_GRACE_MS = 3500;
export const HOVER_SAFETY_TIMEOUT_MS = 2000;
