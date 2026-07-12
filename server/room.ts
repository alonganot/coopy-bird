import type { WebSocket } from 'ws';
import type { SkillId } from '../src/game/skills/data';
import { SHOP_SKILLS } from '../src/game/skills/data';
import type { Pipe } from '../src/game/types';
import type { PlayerColor, PlayerProps, RoomPhase } from './protocol';

export interface ServerPlayer {
  id: string;
  ws: WebSocket;
  name: string;
  color: PlayerColor;
  props: PlayerProps;
  ready: boolean;
  y: number;
  vy: number;
  r: number;
  thrustAnim: number;
  alive: boolean;
  invulnerableUntil: number;
  respawnAt: number | null;
  aliveSinceFrame: number;
  equippedOrder: SkillId[];
  charges: Partial<Record<SkillId, number>>;
  activeTimer: Partial<Record<SkillId, number>>;
  hoverHeld: boolean;
  lastHoverInputAt: number;
  clone: { y: number; vy: number; alive: boolean } | null;
  projectiles: { x: number; y: number; vx: number; hit?: boolean }[];
}

export interface Room {
  phase: RoomPhase;
  players: Map<string, ServerPlayer>;
  pipes: Pipe[];
  score: number;
  frame: number;
  countdownEndsAt: number | null;
  endedAt: number | null;
}

const START_Y = 300; // H/2, matches single-player's makeBird()
const BIRD_R = 18;

export function createRoom(): Room {
  return {
    phase: 'waiting',
    players: new Map(),
    pipes: [],
    score: 0,
    frame: 0,
    countdownEndsAt: null,
    endedAt: null,
  };
}

/** Resets an emptied-out room to a clean slate (called once the last connected player leaves). */
export function resetRoomToWaiting(room: Room): void {
  room.phase = 'waiting';
  room.pipes = [];
  room.score = 0;
  room.frame = 0;
  room.countdownEndsAt = null;
  room.endedAt = null;
}

function emptySkillMap<V>(fill: () => V): Partial<Record<SkillId, V>> {
  const map: Partial<Record<SkillId, V>> = {};
  SHOP_SKILLS.forEach(s => { map[s.id] = fill(); });
  return map;
}

export function createPlayer(
  id: string,
  ws: WebSocket,
  name: string,
  color: PlayerColor,
  props: PlayerProps,
  equippedOrder: SkillId[],
): ServerPlayer {
  return {
    id,
    ws,
    name,
    color,
    props,
    ready: false,
    y: START_Y,
    vy: 0,
    r: BIRD_R,
    thrustAnim: 0,
    alive: true,
    invulnerableUntil: 0,
    respawnAt: null,
    aliveSinceFrame: 0,
    equippedOrder,
    charges: emptySkillMap(() => 0),
    activeTimer: emptySkillMap(() => 0),
    hoverHeld: false,
    lastHoverInputAt: 0,
    clone: null,
    projectiles: [],
  };
}

export function resetPlayerForMatch(p: ServerPlayer, frame: number): void {
  p.y = START_Y;
  p.vy = 0;
  p.thrustAnim = 0;
  p.alive = true;
  p.invulnerableUntil = 0;
  p.respawnAt = null;
  p.aliveSinceFrame = frame;
  p.charges = emptySkillMap(() => 0);
  p.activeTimer = emptySkillMap(() => 0);
  p.hoverHeld = false;
  p.clone = null;
  p.projectiles = [];
}

export function aliveCount(room: Room): number {
  let n = 0;
  room.players.forEach(p => { if (p.alive) n++; });
  return n;
}

export function allReady(room: Room): boolean {
  if (room.players.size === 0) return false;
  for (const p of room.players.values()) if (!p.ready) return false;
  return true;
}

/** "Furthest along" proxy: since score is shared, use the alive player who has gone longest without dying. */
export function findRespawnReference(room: Room): ServerPlayer | null {
  let best: ServerPlayer | null = null;
  room.players.forEach(p => {
    if (!p.alive) return;
    if (!best || p.aliveSinceFrame < best.aliveSinceFrame) best = p;
  });
  return best;
}
