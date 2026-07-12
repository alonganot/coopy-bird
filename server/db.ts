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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id          SERIAL PRIMARY KEY,
      username    TEXT NOT NULL,
      score       INTEGER NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_entries (score DESC);
  `);
}
