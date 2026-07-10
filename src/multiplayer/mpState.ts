import type { LeaderboardEntry, RoomPhase, ServerMessage, SnapshotPlayer } from '../../server/protocol';
import type { Pipe } from '../game/types';

/** Every player's bird sits at this fixed x, matching the server's authoritative simulation. */
export const PLAYER_X = 80;

export interface MpState {
  you: string | null;
  phase: RoomPhase;
  countdownEndsAt: number | null;
  score: number;
  pipes: Pipe[];
  players: SnapshotPlayer[];
  leaderboard: LeaderboardEntry[] | null;
  tick: number;
}

export const mpState: MpState = {
  you: null,
  phase: 'waiting',
  countdownEndsAt: null,
  score: 0,
  pipes: [],
  players: [],
  leaderboard: null,
  tick: 0,
};

export function resetMpState(): void {
  mpState.you = null;
  mpState.phase = 'waiting';
  mpState.countdownEndsAt = null;
  mpState.score = 0;
  mpState.pipes = [];
  mpState.players = [];
  mpState.leaderboard = null;
}

export function applyServerMessage(msg: ServerMessage): void {
  switch (msg.type) {
    case 'joined':
      mpState.you = msg.id;
      break;
    case 'snapshot':
      mpState.phase = msg.phase;
      mpState.countdownEndsAt = msg.countdownEndsAt;
      mpState.score = msg.score;
      mpState.pipes = msg.pipes;
      mpState.players = msg.players;
      mpState.you = msg.you;
      if (msg.leaderboard) mpState.leaderboard = msg.leaderboard;
      break;
    case 'leaderboard':
      mpState.leaderboard = msg.entries;
      break;
  }
}

export function you(): SnapshotPlayer | undefined {
  return mpState.players.find(p => p.id === mpState.you);
}
