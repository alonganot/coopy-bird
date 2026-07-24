import type { LeaderboardEntry, RoomPhase, ServerMessage, SnapshotPlayer } from '../../server/protocol';
import { world } from '../game/state';
import type { Pipe } from '../game/types';

/** Every player's bird sits at this fixed x, matching the server's authoritative simulation. */
export const PLAYER_X = 80;

export interface MpState {
  you: string | null;
  phase: RoomPhase;
  countdownInMs: number | null;
  score: number;
  pipes: Pipe[];
  players: SnapshotPlayer[];
  leaderboard: LeaderboardEntry[] | null;
  tick: number;
  /** Coins earned from the just-finished match, for the match-ended overlay; null once a new round starts. */
  lastCoinsAwarded: number | null;
}

export const mpState: MpState = {
  you: null,
  phase: 'waiting',
  countdownInMs: null,
  score: 0,
  pipes: [],
  players: [],
  leaderboard: null,
  tick: 0,
  lastCoinsAwarded: null,
};

export function resetMpState(): void {
  mpState.you = null;
  mpState.phase = 'waiting';
  mpState.countdownInMs = null;
  mpState.score = 0;
  mpState.pipes = [];
  mpState.players = [];
  mpState.leaderboard = null;
  mpState.lastCoinsAwarded = null;
}

export function applyServerMessage(msg: ServerMessage): void {
  switch (msg.type) {
    case 'joined':
      mpState.you = msg.id;
      break;
    case 'snapshot':
      mpState.phase = msg.phase;
      mpState.countdownInMs = msg.countdownInMs;
      mpState.score = msg.score;
      mpState.pipes = msg.pipes;
      mpState.players = msg.players;
      mpState.you = msg.you;
      if (msg.leaderboard) mpState.leaderboard = msg.leaderboard;
      if (msg.phase !== 'ended') mpState.lastCoinsAwarded = null;
      break;
    case 'leaderboard':
      mpState.leaderboard = msg.entries;
      break;
    case 'coinsAwarded':
      mpState.lastCoinsAwarded = msg.amount;
      // Server is authoritative for the new balance — fold it straight into gameData so a
      // later single-player saveData() push doesn't clobber the award with a stale blob.
      world.gameData.totalCoins = msg.totalCoins;
      break;
  }
}

export function you(): SnapshotPlayer | undefined {
  return mpState.players.find(p => p.id === mpState.you);
}
