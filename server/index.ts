import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { WebSocketServer, type WebSocket } from 'ws';
import { JUMP } from '../src/game/constants';
import { initSchema } from './db';
import { handleHttp } from './http';
import { submitScore, topLeaderboard } from './leaderboard';
import type { ClientMessage, LeaderboardEntry, ServerMessage, SnapshotPlayer } from './protocol';
import { TICK_MS } from './protocol';
import { createPlayer, createRoom, type Room, type ServerPlayer } from './room';
import { activateSkill, mirrorCloneJump, startHover, stopHover } from './skills';
import { stepRoom } from './tick';

const PORT = Number(process.env.PORT ?? 8787);
const HOST = '0.0.0.0'; // listen on every network interface, not just localhost — required for LAN play
const room: Room = createRoom();
const socketToPlayerId = new Map<WebSocket, string>();

function send(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

function toSnapshotPlayer(p: ServerPlayer, now: number): SnapshotPlayer {
  return {
    id: p.id,
    name: p.name,
    color: p.color,
    props: p.props,
    y: p.y,
    vy: p.vy,
    alive: p.alive,
    invulnerable: now < p.invulnerableUntil,
    levitating: p.levitatingUntil !== null,
    respawnInMs: p.respawnAt !== null ? Math.max(0, p.respawnAt - now) : null,
    ready: p.ready,
    equippedOrder: p.equippedOrder,
    charges: p.charges,
    activeTimer: p.activeTimer,
    clone: p.clone ? { y: p.clone.y, alive: p.clone.alive } : null,
  };
}

function broadcastSnapshot(leaderboard?: LeaderboardEntry[]): void {
  const now = Date.now();
  const players = [...room.players.values()].map(p => toSnapshotPlayer(p, now));
  // `you` is the only field that varies per client — stringify the shared (and by far
  // the largest) part of the payload once per tick instead of once per connected
  // client, then splice each client's own id into the already-serialized string.
  const base = {
    type: 'snapshot' as const,
    phase: room.phase,
    countdownEndsAt: room.countdownEndsAt,
    score: room.score,
    pipes: room.pipes,
    players,
    leaderboard,
  };
  const prefix = JSON.stringify(base).slice(0, -1); // drop trailing '}'
  room.players.forEach(p => {
    if (p.ws.readyState !== p.ws.OPEN) return;
    p.ws.send(`${prefix},"you":${JSON.stringify(p.id)}}`);
  });
}

function onMatchEnd(finishedRoom: Room): void {
  // p.name is always the account username now (see the 'join' handler below) — a stable,
  // real per-player key, unlike the free-text lobby nickname this used to be.
  finishedRoom.players.forEach(p => {
    submitScore(p.name, 'multiplayer', finishedRoom.score)
      .catch(err => console.error('Failed to persist leaderboard score:', err));
  });
}

const httpServer = createServer((req, res) => {
  handleHttp(req, res).catch(err => {
    console.error('HTTP handler error:', err);
    if (!res.headersSent) res.writeHead(500);
    res.end();
  });
});

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', ws => {
  const id = randomUUID();

  ws.on('message', raw => {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.type === 'join') {
      const props = msg.props ?? { hat: '', glasses: '', mask: '', shoe: '' };
      const player = createPlayer(id, ws, msg.name || 'Player', msg.color, props, msg.equippedOrder ?? []);
      room.players.set(id, player);
      socketToPlayerId.set(ws, id);
      send(ws, { type: 'joined', id });
      return;
    }

    const playerId = socketToPlayerId.get(ws);
    if (!playerId) return; // must join first
    const player = room.players.get(playerId);
    if (!player) return;

    switch (msg.type) {
      case 'ready':
        player.ready = msg.ready;
        break;
      case 'jump':
        if (player.alive) {
          player.vy = JUMP;
          player.thrustAnim = 1;
          player.levitatingUntil = null;
          mirrorCloneJump(player);
        }
        break;
      case 'skillActivate': {
        const skillId = player.equippedOrder[msg.slot];
        if (skillId) activateSkill(player, skillId, room);
        break;
      }
      case 'skillHoverStart': {
        const id2 = player.equippedOrder[msg.slot];
        if (id2 === 'hover') startHover(player, Date.now());
        break;
      }
      case 'skillHoverStop': {
        const id2 = player.equippedOrder[msg.slot];
        if (id2 === 'hover') stopHover(player);
        break;
      }
      case 'leaderboardRequest':
        topLeaderboard('multiplayer', 10)
          .then(entries => send(ws, { type: 'leaderboard', entries }))
          .catch(err => console.error('Failed to load leaderboard:', err));
        break;
    }
  });

  ws.on('close', () => {
    const playerId = socketToPlayerId.get(ws);
    if (playerId) {
      room.players.delete(playerId);
      socketToPlayerId.delete(ws);
    }
  });
});

// simulateTick() advances game time by a fixed amount per call, so — same as the
// single-player client loop — it must run at a rate derived from real elapsed time
// rather than assuming every setInterval firing represents exactly one tick's worth of
// wall-clock time. Under any load that makes the event loop fall behind (GC pauses, a
// slow host, other work competing for the same process), Node just fires the callback
// again as soon as it's free rather than catching up — without this accumulator, that
// silently makes the whole simulated world (gravity, pipe speed, scoring) run in slow
// motion in real time, exactly the bug already fixed for single-player's rAF loop.
let lastTickTime = Date.now();
let tickAccumulator = 0;
const MAX_TICKS_PER_INTERVAL = 5; // avoids a catch-up burst after e.g. an event-loop stall

setInterval(() => {
  const now = Date.now();
  tickAccumulator += Math.min(now - lastTickTime, 250);
  lastTickTime = now;

  const wasEnded = room.phase === 'ended';
  let steps = 0;
  while (tickAccumulator >= TICK_MS && steps < MAX_TICKS_PER_INTERVAL) {
    stepRoom(room, Date.now(), { onMatchEnd });
    tickAccumulator -= TICK_MS;
    steps++;
  }
  if (steps === 0) return; // not enough real time has elapsed yet for another tick

  if (!wasEnded && room.phase === 'ended') {
    topLeaderboard('multiplayer', 10)
      .then(entries => broadcastSnapshot(entries))
      .catch(err => {
        console.error('Failed to load leaderboard:', err);
        broadcastSnapshot();
      });
  } else {
    broadcastSnapshot();
  }
}, TICK_MS);

function logListening(): void {
  console.log('Multiplayer server listening:');
  console.log(`  Local:   http://localhost:${PORT}  (ws://localhost:${PORT})`);
  Object.values(networkInterfaces()).flat().forEach(net => {
    if (net && net.family === 'IPv4' && !net.internal) {
      console.log(`  Network: http://${net.address}:${PORT}  (ws://${net.address}:${PORT})`);
    }
  });
}

initSchema()
  .then(() => {
    httpServer.listen(PORT, HOST, logListening);
  })
  .catch(err => {
    console.error('Fatal: failed to initialize database schema:', err);
    process.exit(1);
  });
