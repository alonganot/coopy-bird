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

/**
 * Atomically increments `totalCoins` against whatever is currently stored, rather than a
 * read-modify-write in JS — safe against a concurrent full-blob `savePlayerData` write (e.g.
 * a client's own `pushGameData` firing around the same time) clobbering the award.
 */
export async function awardCoins(username: string, amount: number): Promise<number> {
  const result = await pool.query<{ total: number }>(
    `UPDATE players
     SET game_data = jsonb_set(game_data, '{totalCoins}', to_jsonb(COALESCE((game_data->>'totalCoins')::int, 0) + $2::int)),
         updated_at = now()
     WHERE username = $1
     RETURNING (game_data->>'totalCoins')::int AS total`,
    [username, amount],
  );
  return result.rows[0]?.total ?? 0;
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
