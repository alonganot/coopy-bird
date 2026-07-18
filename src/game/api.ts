import type { LeaderboardEntry } from '../../server/protocol';
import type { GameData } from './persistence';

export type LeaderboardMode = 'singleplayer' | 'multiplayer';
export type RenameResult = { ok: true } | { ok: false; reason: 'taken' | 'invalid' };

const DEFAULT_PORT = '8787';

/**
 * Mirrors multiplayer/connection.ts's resolveServerUrl(): defaults to the page's own
 * hostname (so it works whether the page was opened via localhost or a LAN IP) rather
 * than a hardcoded "localhost". VITE_API_URL overrides this entirely for production,
 * where the client and API are typically on different domains.
 */
function resolveApiUrl(): string {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  const port = import.meta.env.VITE_MP_SERVER_PORT || DEFAULT_PORT;
  return `http://${window.location.hostname}:${port}`;
}

/** Creates the username's save-data row if it doesn't exist yet, otherwise returns the existing one. */
export async function fetchOrCreateSession(username: string): Promise<GameData> {
  const res = await fetch(`${resolveApiUrl()}/api/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Session request failed (${res.status})`);
  }
  const { gameData } = await res.json();
  return gameData as GameData;
}

/** Fire-and-forget from the caller's perspective — errors are logged, not thrown. */
export function pushGameData(username: string, gameData: GameData): void {
  if (!username) return;
  fetch(`${resolveApiUrl()}/api/players/${encodeURIComponent(username)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameData }),
  }).catch(err => console.error('Failed to save game data:', err));
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const res = await fetch(`${resolveApiUrl()}/api/players/${encodeURIComponent(username)}/exists`);
  if (!res.ok) throw new Error(`Username check failed (${res.status})`);
  const { exists } = await res.json();
  return Boolean(exists);
}

export async function renameUsername(oldUsername: string, newUsername: string): Promise<RenameResult> {
  const res = await fetch(`${resolveApiUrl()}/api/players/${encodeURIComponent(oldUsername)}/rename`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newUsername }),
  });
  if (res.ok) return { ok: true };
  if (res.status === 409) return { ok: false, reason: 'taken' };
  return { ok: false, reason: 'invalid' };
}

/** Fire-and-forget from the caller's perspective — errors are logged, not thrown. */
export function submitScore(username: string, score: number): void {
  if (!username || score <= 0) return;
  fetch(`${resolveApiUrl()}/api/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, score }),
  }).catch(err => console.error('Failed to submit score:', err));
}

export async function fetchLeaderboard(mode: LeaderboardMode): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${resolveApiUrl()}/api/leaderboard/${mode}`);
  if (!res.ok) throw new Error(`Leaderboard fetch failed (${res.status})`);
  const { entries } = await res.json();
  return entries as LeaderboardEntry[];
}
