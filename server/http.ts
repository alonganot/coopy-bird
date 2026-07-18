import type { IncomingMessage, ServerResponse } from 'node:http';
import { migrateData } from '../src/game/persistence';
import { submitScore, topLeaderboard, type LeaderboardMode } from './leaderboard';
import { getOrCreatePlayer, renamePlayer, savePlayerData, usernameExists } from './players';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/;
const MAX_BODY_BYTES = 64 * 1024; // GameData is a few KB at most; this is a generous ceiling.
/** Postgres unique_violation error code — thrown by renamePlayer() when the target username is taken. */
const PG_UNIQUE_VIOLATION = '23505';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    let bytes = 0;
    req.on('data', (chunk: Buffer) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const json = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(json);
}

function applyCors(_req: IncomingMessage, res: ServerResponse): void {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/** Handles everything that isn't a WebSocket upgrade: health check + the session/save-data API. */
export async function handleHttp(req: IncomingMessage, res: ServerResponse): Promise<void> {
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', 'http://internal');

  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/session') {
    try {
      const body = JSON.parse(await readBody(req));
      const username: unknown = body?.username;
      if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
        sendJson(res, 400, { error: 'Username must be 3-16 letters, numbers, or underscores' });
        return;
      }
      const gameData = await getOrCreatePlayer(username);
      sendJson(res, 200, { gameData });
    } catch {
      sendJson(res, 400, { error: 'Invalid request' });
    }
    return;
  }

  const existsMatch = url.pathname.match(/^\/api\/players\/([^/]+)\/exists$/);
  if (req.method === 'GET' && existsMatch) {
    const username = decodeURIComponent(existsMatch[1]);
    if (!USERNAME_RE.test(username)) {
      sendJson(res, 400, { error: 'Invalid username' });
      return;
    }
    sendJson(res, 200, { exists: await usernameExists(username) });
    return;
  }

  const renameMatch = url.pathname.match(/^\/api\/players\/([^/]+)\/rename$/);
  if (req.method === 'PUT' && renameMatch) {
    const oldUsername = decodeURIComponent(renameMatch[1]);
    try {
      const body = JSON.parse(await readBody(req));
      const newUsername: unknown = body?.newUsername;
      if (typeof newUsername !== 'string' || !USERNAME_RE.test(newUsername)) {
        sendJson(res, 400, { error: 'Username must be 3-16 letters, numbers, or underscores' });
        return;
      }
      await renamePlayer(oldUsername, newUsername);
      sendJson(res, 200, { username: newUsername });
    } catch (err) {
      if ((err as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        sendJson(res, 409, { error: 'taken' });
      } else {
        sendJson(res, 404, { error: 'Player not found' });
      }
    }
    return;
  }

  const playerMatch = url.pathname.match(/^\/api\/players\/([^/]+)$/);
  if (req.method === 'PUT' && playerMatch) {
    const username = decodeURIComponent(playerMatch[1]);
    if (!USERNAME_RE.test(username)) {
      sendJson(res, 400, { error: 'Invalid username' });
      return;
    }
    try {
      const body = JSON.parse(await readBody(req));
      const gameData = migrateData(body?.gameData ?? {});
      await savePlayerData(username, gameData);
      sendJson(res, 200, { ok: true });
    } catch {
      sendJson(res, 400, { error: 'Invalid request' });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/scores') {
    try {
      const body = JSON.parse(await readBody(req));
      const username: unknown = body?.username;
      const score: unknown = body?.score;
      if (typeof username !== 'string' || !USERNAME_RE.test(username)) {
        sendJson(res, 400, { error: 'Invalid username' });
        return;
      }
      if (typeof score !== 'number' || !Number.isInteger(score) || score < 0 || score > 1_000_000) {
        sendJson(res, 400, { error: 'Invalid score' });
        return;
      }
      await submitScore(username, 'singleplayer', score);
      sendJson(res, 200, { ok: true });
    } catch {
      sendJson(res, 400, { error: 'Invalid request' });
    }
    return;
  }

  const leaderboardMatch = url.pathname.match(/^\/api\/leaderboard\/(singleplayer|multiplayer)$/);
  if (req.method === 'GET' && leaderboardMatch) {
    const mode = leaderboardMatch[1] as LeaderboardMode;
    sendJson(res, 200, { entries: await topLeaderboard(mode, 10) });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}
