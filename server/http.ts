import type { IncomingMessage, ServerResponse } from 'node:http';
import { migrateData } from '../src/game/persistence';
import { getOrCreatePlayer, savePlayerData } from './players';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,16}$/;
const MAX_BODY_BYTES = 64 * 1024; // GameData is a few KB at most; this is a generous ceiling.

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

  sendJson(res, 404, { error: 'Not found' });
}
