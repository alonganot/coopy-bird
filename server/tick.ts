import { DASH_SPEED_MULTIPLIER, GAP, GRAVITY, H, PIPE_W, SPEED, W } from '../src/game/constants';
import type { SkillId } from '../src/game/skills/data';
import type { Pipe } from '../src/game/types';
import { collides } from './collision';
import { INVULNERABILITY_MS, READY_COUNTDOWN_MS, RESPAWN_DELAY_MS } from './protocol';
import { aliveCount, allReady, findRespawnReference, resetPlayerForMatch, resetRoomToWaiting, type Room, type ServerPlayer } from './room';
import { getBirdRadius, grantChargesOnScore, isSkillActive, trySwapToClone, updateSkillsForPlayer, PLAYER_X } from './skills';

export interface TickCallbacks {
  onMatchEnd(room: Room): void;
}

/** Always requires an explicit ready-up, even for a single connected player. */
function nextPhaseForConnectionCount(room: Room): void {
  if (room.players.size >= 1) {
    room.phase = 'ready-check';
    room.players.forEach(p => { p.ready = false; });
  } else {
    room.phase = 'waiting';
  }
}

function startCountdown(room: Room, now: number): void {
  room.phase = 'countdown';
  room.countdownEndsAt = now + READY_COUNTDOWN_MS;
}

function startPlaying(room: Room): void {
  room.phase = 'playing';
  room.frame = 0;
  room.score = 0;
  room.pipes = [];
  room.players.forEach(p => resetPlayerForMatch(p, 0));
}

function spawnPipe(room: Room): void {
  const topH = 80 + Math.random() * (H - GAP - 160);
  room.pipes.push({ x: W, topH, passed: false, glowPhase: Math.random() * Math.PI * 2 });
}

function killPlayer(p: ServerPlayer, room: Room, now: number, callbacks: TickCallbacks): void {
  p.alive = false;
  p.respawnAt = now + RESPAWN_DELAY_MS;
  if (aliveCount(room) === 0) {
    room.phase = 'ended';
    room.endedAt = now;
    callbacks.onMatchEnd(room);
  }
}

function simulateTick(room: Room, now: number, callbacks: TickCallbacks): void {
  const alivePlayers = [...room.players.values()].filter(p => p.alive);

  // 1. Gravity per alive player
  alivePlayers.forEach(p => {
    const timeSlow = isSkillActive(p, 'timeSlow') ? 0.5 : 1;
    if (isSkillActive(p, 'dash')) p.vy *= 0.7;
    p.vy += GRAVITY * timeSlow;
    p.y += p.vy;
  });

  // 2. Shared pipe speed — most impactful active effect wins: freeze > dash > timeSlow > normal
  const freezing = alivePlayers.some(p => isSkillActive(p, 'freezeFrame'));
  const dashingAny = alivePlayers.some(p => isSkillActive(p, 'dash'));
  const timeSlowAny = alivePlayers.some(p => isSkillActive(p, 'timeSlow'));
  const currentSpeed = freezing ? 0
    : dashingAny ? SPEED * DASH_SPEED_MULTIPLIER
    : timeSlowAny ? SPEED * 0.5
    : SPEED;

  // 3. Spawn + 4. move/cull pipes
  if (!freezing && room.frame % 90 === 0) spawnPipe(room);
  room.pipes.forEach(p => { p.x -= currentSpeed; });
  room.pipes = room.pipes.filter(p => p.x + PIPE_W > 0);

  // 5. Per-player skill timers/effects (projectiles, earthquake sink, clone physics)
  alivePlayers.forEach(p => updateSkillsForPlayer(p, room, now));

  // 6. Scoring — one shared counter, incremented once per pipe crossed (every bird shares the same fixed x)
  room.pipes.forEach(p => {
    if (!p.passed && alivePlayers.length > 0 && PLAYER_X > p.x + PIPE_W) {
      p.passed = true;
      room.score++;
      room.players.forEach(pl => grantChargesOnScore(pl, room.score));
    }
  });

  // 7. Collision — dash destroys, invisible/invulnerable pass through, otherwise die (unless a clone survives)
  for (const p of alivePlayers) {
    if (!p.alive) continue;
    const dashing = isSkillActive(p, 'dash');
    const invisible = isSkillActive(p, 'invisibility');
    const invulnerable = now < p.invulnerableUntil;
    const br = getBirdRadius(p);
    for (const pipe of room.pipes as Pipe[]) {
      if (!collides({ x: PLAYER_X, y: p.y, r: br }, pipe)) continue;
      if (dashing) {
        pipe.destroyed = true;
      } else if (invisible || invulnerable) {
        // pass through safely
      } else if (!trySwapToClone(p)) {
        killPlayer(p, room, now, callbacks);
        break;
      }
    }
  }
  room.pipes = room.pipes.filter(p => !p.destroyed);

  // 8. Floor/ceiling bounds
  for (const p of alivePlayers) {
    if (!p.alive) continue;
    if (p.y + p.r > H - 50 || p.y - p.r < 0) {
      if (!trySwapToClone(p)) killPlayer(p, room, now, callbacks);
    }
  }

  // 9. Respawn processing
  room.players.forEach(p => {
    if (p.alive || p.respawnAt === null || now < p.respawnAt) return;
    const ref = findRespawnReference(room);
    if (!ref) return; // alive-count already hit 0 this tick; the match-end check above already fired
    p.y = ref.y;
    p.vy = 0;
    p.alive = true;
    p.invulnerableUntil = now + INVULNERABILITY_MS;
    p.respawnAt = null;
    p.aliveSinceFrame = room.frame;
    (Object.keys(p.activeTimer) as SkillId[]).forEach(k => { p.activeTimer[k] = 0; });
    p.hoverHeld = false;
    p.clone = null;
  });

  room.frame++;
}

/** Advances the room's phase machine by one tick; called at TICK_MS cadence. */
export function stepRoom(room: Room, now: number, callbacks: TickCallbacks): void {
  // Nobody left connected — stop simulating and drop back to a clean slate, regardless of phase.
  if (room.players.size === 0) {
    if (room.phase !== 'waiting') resetRoomToWaiting(room);
    return;
  }

  switch (room.phase) {
    case 'waiting':
      nextPhaseForConnectionCount(room);
      break;
    case 'ready-check':
      if (allReady(room)) startCountdown(room, now);
      break;
    case 'countdown':
      if (room.countdownEndsAt !== null && now >= room.countdownEndsAt) startPlaying(room);
      break;
    case 'playing':
      simulateTick(room, now, callbacks);
      break;
    case 'ended':
      if (room.endedAt !== null && now - room.endedAt > 5000) {
        room.players.forEach(p => { p.ready = false; });
        nextPhaseForConnectionCount(room);
      }
      break;
  }
}
