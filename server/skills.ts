import { GAP, GRAVITY, H, JUMP, PIPE_W } from '../src/game/constants';
import { MAX_EQUIPPED_SKILLS, SHOP_SKILLS, type SkillId } from '../src/game/skills/data';
import type { Pipe } from '../src/game/types';
import { collides } from './collision';
import type { Room, ServerPlayer } from './room';

export const PLAYER_X = 80; // fixed for every player, matches single-player's bird.x

export function isSkillEquipped(p: ServerPlayer, id: SkillId): boolean {
  return p.equippedOrder.includes(id);
}

export function isSkillActive(p: ServerPlayer, id: SkillId): boolean {
  return (p.activeTimer[id] ?? 0) > 0;
}

export function getBirdRadius(p: ServerPlayer): number {
  return isSkillActive(p, 'shrink') ? p.r * 0.5 : p.r;
}

export function activateSkill(p: ServerPlayer, id: SkillId, room: Room): void {
  const skill = SHOP_SKILLS.find(s => s.id === id);
  if (!skill || !p.alive || !isSkillEquipped(p, id)) return;
  if (id === 'hover') return; // hold-to-activate, see startHover/stopHover
  if (id === 'shadowClone' && p.clone && p.clone.alive) return;
  if ((p.activeTimer[id] ?? 0) > 0 || (p.charges[id] ?? 0) <= 0) return;
  p.charges[id] = (p.charges[id] ?? 0) - 1;
  p.activeTimer[id] = skill.duration;
  if (id === 'shooting') p.projectiles.push({ x: PLAYER_X + p.r, y: p.y, vx: 9 });
  if (id === 'earthquake') triggerEarthquake(room);
  if (id === 'shadowClone') spawnClone(p);
}

export function startHover(p: ServerPlayer, now: number): void {
  if (!p.alive || !isSkillEquipped(p, 'hover') || p.hoverHeld) return;
  if ((p.activeTimer.hover ?? 0) <= 0) {
    if ((p.charges.hover ?? 0) <= 0) return;
    p.charges.hover = (p.charges.hover ?? 0) - 1;
    p.activeTimer.hover = SHOP_SKILLS.find(s => s.id === 'hover')!.duration;
  }
  p.hoverHeld = true;
  p.lastHoverInputAt = now;
}

export function stopHover(p: ServerPlayer): void {
  p.hoverHeld = false;
}

function triggerEarthquake(room: Room): void {
  const target = room.pipes.find(p => !p.passed && !p.sinking && p.x + PIPE_W > PLAYER_X);
  if (!target) return;
  const skill = SHOP_SKILLS.find(s => s.id === 'earthquake')!;
  target.sinking = true;
  target.sinkTimer = skill.duration;
  target.sinkDuration = skill.duration;
}

function spawnClone(p: ServerPlayer): void {
  const above = p.y - 60 >= 20;
  const y = above ? p.y - 60 : p.y + 60;
  p.clone = { y: Math.max(20, Math.min(H - 70, y)), vy: p.vy, alive: true };
}

export function mirrorCloneJump(p: ServerPlayer): void {
  if (p.clone && p.clone.alive) p.clone.vy = JUMP;
}

/** Grants an equipped-skill charge when the shared score crosses that skill's chargeThreshold. */
export function grantChargesOnScore(p: ServerPlayer, score: number): void {
  SHOP_SKILLS.forEach(s => {
    if (isSkillEquipped(p, s.id) && score % s.chargeThreshold === 0) {
      p.charges[s.id] = (p.charges[s.id] ?? 0) + 1;
    }
  });
}

/**
 * Returns true if death was averted by swapping control to a surviving Shadow Clone
 * (mirrors the client's attemptDeath()); false means the caller should actually kill p.
 */
export function trySwapToClone(p: ServerPlayer): boolean {
  if (p.clone && p.clone.alive) {
    p.y = p.clone.y;
    p.vy = p.clone.vy;
    p.clone = null;
    return true;
  }
  return false;
}

/** Per-player per-tick skill bookkeeping: timers, hover clamp, projectiles, earthquake countdown, clone physics. */
export function updateSkillsForPlayer(p: ServerPlayer, room: Room, now: number): void {
  SHOP_SKILLS.forEach(s => {
    if (s.id === 'hover') {
      if (p.hoverHeld && (p.activeTimer.hover ?? 0) > 0) p.activeTimer.hover!--;
      if ((p.activeTimer.hover ?? 0) <= 0) p.hoverHeld = false;
    } else if ((p.activeTimer[s.id] ?? 0) > 0) {
      p.activeTimer[s.id]!--;
    }
  });

  // Safety timeout: force-stop hover if no fresh input for a while (dropped skillHoverStop message).
  if (p.hoverHeld && now - p.lastHoverInputAt > 2000) p.hoverHeld = false;

  if (p.hoverHeld && isSkillActive(p, 'hover')) {
    p.vy = Math.min(p.vy, 1.2);
  }

  // Projectiles (shooting)
  p.projectiles.forEach(pr => { pr.x += pr.vx; });
  p.projectiles.forEach(pr => {
    room.pipes.forEach((pipe: Pipe) => {
      if (!pipe.destroyed && pr.x + 4 > pipe.x && pr.x - 4 < pipe.x + PIPE_W && (pr.y < pipe.topH || pr.y > pipe.topH + GAP)) {
        pipe.destroyed = true;
        pr.hit = true;
      }
    });
  });
  p.projectiles = p.projectiles.filter(pr => !pr.hit && pr.x < 420);

  // Shadow Clone physics — independent gravity + collision against the shared pipes
  if (p.clone && p.clone.alive) {
    const clone = p.clone;
    clone.vy += GRAVITY;
    clone.y += clone.vy;
    let dead = clone.y + p.r > H - 50 || clone.y - p.r < 0;
    if (!dead) {
      room.pipes.forEach(pipe => {
        if (!pipe.sinking && collides({ x: PLAYER_X, y: clone.y, r: p.r }, pipe)) dead = true;
      });
    }
    if (dead) p.clone = null;
  }
}

export { MAX_EQUIPPED_SKILLS };
