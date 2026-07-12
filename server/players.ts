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
