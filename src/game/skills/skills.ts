import { GAP, GRAVITY, H, JUMP, PIPE_W, W } from '../constants';
import { getActiveColorItem } from '../shop/data';
import { onDeath, spawnPipeBreakParticles } from '../scoring';
import { world } from '../state';
import type { Collidable } from '../types';
import { collides } from '../update';
import { SHOP_SKILLS, type SkillId } from './data';
import { skillState } from './state';

export function isSkillEquipped(id: SkillId): boolean {
  return world.gameData.equippedOrder.includes(id);
}

export function isSkillActive(id: SkillId): boolean {
  return skillState.activeTimer[id] > 0;
}

export function isSkillVisuallyActive(id: SkillId): boolean {
  return id === 'shadowClone' ? !!(skillState.clone && skillState.clone.alive) : isSkillActive(id);
}

export function activateSkill(id: SkillId): void {
  const skill = SHOP_SKILLS.find(s => s.id === id);
  if (!skill || world.state !== 'play' || !isSkillEquipped(id)) return;
  if (id === 'hover') return; // hold-to-activate, see startHover/stopHover
  if (id === 'shadowClone' && skillState.clone && skillState.clone.alive) return;
  if (skillState.activeTimer[id] > 0 || skillState.charges[id] <= 0) return;
  skillState.charges[id]--;
  skillState.activeTimer[id] = skill.duration;
  if (id === 'shooting') spawnProjectile();
  if (id === 'earthquake') triggerEarthquake();
  if (id === 'shadowClone') spawnClone();
}

export function startHover(): void {
  if (world.state !== 'play' || !isSkillEquipped('hover') || skillState.hoverHeld) return;
  if (skillState.activeTimer.hover <= 0) {
    if (skillState.charges.hover <= 0) return;
    skillState.charges.hover--;
    skillState.activeTimer.hover = SHOP_SKILLS.find(s => s.id === 'hover')!.duration;
  }
  skillState.hoverHeld = true;
}

export function stopHover(): void {
  skillState.hoverHeld = false;
}

export function getBirdRadius(b: Collidable): number {
  return b === world.bird && isSkillActive('shrink') ? b.r * 0.5 : b.r;
}

function spawnProjectile(): void {
  world.projectiles.push({ x: world.bird.x + world.bird.r, y: world.bird.y, vx: 9 });
}

function triggerEarthquake(): void {
  const target = world.pipes.find(p => !p.passed && !p.sinking && p.x + PIPE_W > world.bird.x);
  if (!target) return;
  const skill = SHOP_SKILLS.find(s => s.id === 'earthquake')!;
  target.sinking = true;
  target.sinkTimer = skill.duration;
  target.sinkDuration = skill.duration;
}

function spawnClone(): void {
  const above = world.bird.y - 60 >= 20;
  const y = above ? world.bird.y - 60 : world.bird.y + 60;
  skillState.clone = { y: Math.max(20, Math.min(H - 70, y)), vy: world.bird.vy, r: world.bird.r, alive: true };
}

export function mirrorCloneJump(): void {
  if (skillState.clone && skillState.clone.alive) skillState.clone.vy = JUMP;
}

function spawnCloneDeathParticles(): void {
  const col = getActiveColorItem(world.gameData);
  for (let i = 0; i < 16; i++) {
    const angle = (Math.PI * 2 / 16) * i;
    const spd = 2 + Math.random() * 3;
    world.particles.push({ x: world.bird.x, y: skillState.clone!.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1, life: 1, type: 'debris', color: col.body });
  }
}

/**
 * Called instead of onDeath() wherever the main bird would die — swaps
 * control to a surviving clone if one exists, otherwise ends the run.
 */
export function attemptDeath(): void {
  if (skillState.clone && skillState.clone.alive) {
    const col = getActiveColorItem(world.gameData);
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const spd = 2 + Math.random() * 3;
      world.particles.push({ x: world.bird.x, y: world.bird.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1, life: 1, type: 'debris', color: col.body });
    }
    world.bird.y = skillState.clone.y;
    world.bird.vy = skillState.clone.vy;
    skillState.clone = null;
  } else {
    onDeath();
  }
}

export function drawClone(ctx: CanvasRenderingContext2D): void {
  const clone = skillState.clone;
  if (!clone || !clone.alive) return;
  const col = getActiveColorItem(world.gameData);
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.translate(world.bird.x, clone.y);
  const angle = Math.max(-0.5, Math.min(Math.PI / 4, clone.vy * 0.05));
  ctx.rotate(angle);
  ctx.shadowBlur = 14;
  ctx.shadowColor = col.glow;
  ctx.fillStyle = col.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, clone.r, clone.r - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = col.wing;
  ctx.beginPath();
  ctx.ellipse(-4, 5, 10, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Called from update() once per frame, after gravity/pipe movement, before scoring/collision. */
export function updateSkills(): void {
  SHOP_SKILLS.forEach(s => {
    if (s.id === 'hover') {
      if (skillState.hoverHeld && skillState.activeTimer.hover > 0) skillState.activeTimer.hover--;
      if (skillState.activeTimer.hover <= 0) skillState.hoverHeld = false;
    } else if (skillState.activeTimer[s.id] > 0) {
      skillState.activeTimer[s.id]--;
    }
  });

  if (isSkillActive('invisibility') && world.frame % 3 === 0) {
    world.particles.push({ x: world.bird.x + (Math.random() - 0.5) * 20, y: world.bird.y + (Math.random() - 0.5) * 20, vy: -0.5, life: 1, type: 'shimmer', color: '#a29bfe' });
  }

  if (skillState.hoverHeld && isSkillActive('hover')) {
    world.bird.vy = Math.min(world.bird.vy, 1.2);
  }

  // Projectiles (shooting)
  world.projectiles.forEach(pr => { pr.x += pr.vx; });
  world.projectiles.forEach(pr => {
    world.pipes.forEach(p => {
      if (!p.destroyed && pr.x + 4 > p.x && pr.x - 4 < p.x + PIPE_W && (pr.y < p.topH || pr.y > p.topH + GAP)) {
        p.destroyed = true;
        pr.hit = true;
        spawnPipeBreakParticles(p);
      }
    });
  });
  world.projectiles = world.projectiles.filter(pr => !pr.hit && pr.x < W + 20);

  // Earthquake — sink animation countdown
  world.pipes.forEach(p => {
    if (p.sinking) {
      p.sinkTimer!--;
      if (p.sinkTimer! <= 0) p.destroyed = true;
    }
  });

  // Shadow Clone physics — independent gravity + collision
  if (skillState.clone && skillState.clone.alive) {
    const clone = skillState.clone;
    clone.vy += GRAVITY;
    clone.y += clone.vy;
    let dead = clone.y + clone.r > H - 50 || clone.y - clone.r < 0;
    if (!dead) {
      world.pipes.forEach(p => {
        if (!p.sinking && collides({ x: world.bird.x, y: clone.y, r: clone.r }, p)) dead = true;
      });
    }
    if (dead) {
      spawnCloneDeathParticles();
      skillState.clone = null;
    }
  }
}
