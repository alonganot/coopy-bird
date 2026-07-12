import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { WebSocketServer, type WebSocket } from 'ws';
import { JUMP } from '../src/game/constants';
import { initSchema } from './db';
import { handleHttp } from './http';
import { appendLeaderboardEntries, topLeaderboard } from './leaderboard';
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
  room.players.forEach(p => {
    send(p.ws, {
      type: 'snapshot',
      phase: room.phase,
      countdownEndsAt: room.countdownEndsAt,
      score: room.score,
      pipes: room.pipes,
      players,
      you: p.id,
      leaderboard,
    });
  });
}

function onMatchEnd(finishedRoom: Room): void {
  const entries: LeaderboardEntry[] = [...finishedRoom.players.values()].map(p => ({
    name: p.name,
    score: finishedRoom.score,
    timestamp: Date.now(),
  }));
  appendLeaderboardEntries(entries).catch(err => console.error('Failed to persist leaderboard entries:', err));
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
      case 'rename': {
        const name = msg.name.trim().slice(0, 16);
        if (name) player.name = name;
        break;
      }
      case 'ready':
        player.ready = msg.ready;
        break;
      case 'jump':
        if (player.alive) {
          player.vy = JUMP;
          player.thrustAnim = 1;
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
        topLeaderboard(10)
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

setInterval(() => {
  const now = Date.now();
  const wasEnded = room.phase === 'ended';
  stepRoom(room, now, { onMatchEnd });
  if (!wasEnded && room.phase === 'ended') {
    topLeaderboard(10)
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
