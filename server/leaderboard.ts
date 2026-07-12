import type { LeaderboardEntry } from './protocol';
import { pool } from './db';

const MAX_ENTRIES = 100;

export async function appendLeaderboardEntries(entries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
  for (const entry of entries) {
    await pool.query(
      'INSERT INTO leaderboard_entries (username, score, created_at) VALUES ($1, $2, to_timestamp($3 / 1000.0))',
      [entry.name, entry.score, entry.timestamp],
    );
  }
  // Trim to the top MAX_ENTRIES globally so the table doesn't grow unbounded.
  await pool.query(`
    DELETE FROM leaderboard_entries
    WHERE id NOT IN (SELECT id FROM leaderboard_entries ORDER BY score DESC LIMIT $1)
  `, [MAX_ENTRIES]);
  return topLeaderboard(MAX_ENTRIES);
}

export async function topLeaderboard(n = 10): Promise<LeaderboardEntry[]> {
  const result = await pool.query<{ username: string; score: number; created_at: Date }>(
    'SELECT username, score, created_at FROM leaderboard_entries ORDER BY score DESC LIMIT $1',
    [n],
  );
  return result.rows.map(row => ({
    name: row.username,
    score: row.score,
    timestamp: row.created_at.getTime(),
  }));
}
