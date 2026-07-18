import { migrateData, type GameData } from '../src/game/persistence';
import { pool } from './db';

export async function getOrCreatePlayer(username: string): Promise<GameData> {
  const existing = await pool.query<{ game_data: Partial<GameData> }>(
    'SELECT game_data FROM players WHERE username = $1',
    [username],
  );
  if (existing.rows.length > 0) {
    return migrateData(existing.rows[0].game_data);
  }
  const fresh = migrateData({});
  await pool.query(
    'INSERT INTO players (username, game_data) VALUES ($1, $2)',
    [username, JSON.stringify(fresh)],
  );
  return fresh;
}

export async function savePlayerData(username: string, gameData: GameData): Promise<void> {
  await pool.query(
    `INSERT INTO players (username, game_data, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (username) DO UPDATE SET game_data = $2, updated_at = now()`,
    [username, JSON.stringify(gameData)],
  );
}

export async function usernameExists(username: string): Promise<boolean> {
  const result = await pool.query('SELECT 1 FROM players WHERE username = $1', [username]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Renaming is a single UPDATE on the primary key — the `leaderboard_best.username`
 * foreign key's ON UPDATE CASCADE (see db.ts) propagates the new name to any
 * leaderboard rows atomically. If `newUsername` is already taken, Postgres throws a
 * unique-violation (error code 23505) on the primary key, which callers should catch.
 */
export async function renamePlayer(oldUsername: string, newUsername: string): Promise<void> {
  const result = await pool.query(
    'UPDATE players SET username = $1, updated_at = now() WHERE username = $2',
    [newUsername, oldUsername],
  );
  if ((result.rowCount ?? 0) === 0) {
    throw new Error(`No player found with username "${oldUsername}"`);
  }
}
