import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Free-tier hosted Postgres (Neon, Supabase, etc.) requires TLS but usually presents
  // a cert chain `pg` won't validate out of the box; this is the standard escape hatch.
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
});

/** Idempotent schema bootstrap — no separate migration tool needed at this scale. */
export async function initSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      username    TEXT PRIMARY KEY,
      game_data   JSONB NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  // Superseded by leaderboard_best below (undeduped, keyed by an unstable nickname) — dropped, not migrated.
  await pool.query(`DROP TABLE IF EXISTS leaderboard_entries;`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leaderboard_best (
      username    TEXT NOT NULL REFERENCES players(username) ON UPDATE CASCADE ON DELETE CASCADE,
      mode        TEXT NOT NULL CHECK (mode IN ('singleplayer', 'multiplayer')),
      score       INTEGER NOT NULL,
      achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (username, mode)
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_best_mode_score ON leaderboard_best (mode, score DESC);
  `);
}
