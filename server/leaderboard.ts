import type { LeaderboardEntry } from './protocol';
import { pool } from './db';

export type LeaderboardMode = 'singleplayer' | 'multiplayer';

/** Upserts the player's best score for this mode — a no-op if the new score isn't higher. */
export async function submitScore(username: string, mode: LeaderboardMode, score: number): Promise<void> {
  await pool.query(
    `INSERT INTO leaderboard_best (username, mode, score, achieved_at) VALUES ($1, $2, $3, now())
     ON CONFLICT (username, mode) DO UPDATE SET score = $3, achieved_at = now()
     WHERE leaderboard_best.score < $3`,
    [username, mode, score],
  );
}

export async function topLeaderboard(mode: LeaderboardMode, n = 10): Promise<LeaderboardEntry[]> {
  const result = await pool.query<{ username: string; score: number; achieved_at: Date }>(
    'SELECT username, score, achieved_at FROM leaderboard_best WHERE mode = $1 ORDER BY score DESC LIMIT $2',
    [mode, n],
  );
  return result.rows.map(row => ({
    name: row.username,
    score: row.score,
    timestamp: row.achieved_at.getTime(),
  }));
}
