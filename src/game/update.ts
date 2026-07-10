import { DASH_SPEED_MULTIPLIER, GAP, GRAVITY, H, PIPE_W, SPEED, W } from './constants';
import { onScore, spawnPipeBreakParticles } from './scoring';
import { attemptDeath, getBirdRadius, isSkillActive, updateSkills } from './skills/skills';
import { world } from './state';
import type { Collidable, Pipe } from './types';

export function collides(b: Collidable, p: Pipe): boolean {
  const br = getBirdRadius(b) - 4;
  if (p.sinking) return false;
  if (b.x + br > p.x && b.x - br < p.x + PIPE_W) {
    if (b.y - br < p.topH || b.y + br > p.topH + GAP) return true;
  }
  return false;
}

export function spawnPipe(): void {
  const topH = 80 + Math.random() * (H - GAP - 160);
  world.pipes.push({ x: W, topH, passed: false, glowPhase: Math.random() * Math.PI * 2 });
}

export function update(): void {
  world.particles.forEach(p => { p.x += p.vx || 0; p.y += p.vy || 0; p.life -= 0.03; });
  world.particles = world.particles.filter(p => p.life > 0);
  if (world.state !== 'play') return;

  const dashing = isSkillActive('dash');
  const invisible = isSkillActive('invisibility');
  const timeSlow = isSkillActive('timeSlow') ? 0.5 : 1;
  const freezing = isSkillActive('freezeFrame');

  if (dashing) {
    // Reduce gravity pull during dash for a horizontal feel
    world.bird.vy *= 0.7;
  }

  world.bird.vy += GRAVITY * timeSlow;
  world.bird.y += world.bird.vy;

  const currentSpeed = freezing ? 0 : (dashing ? SPEED * DASH_SPEED_MULTIPLIER : SPEED) * timeSlow;
  if (!freezing && world.frame % 90 === 0) spawnPipe();
  world.pipes.forEach(p => { p.x -= currentSpeed; });
  world.pipes = world.pipes.filter(p => p.x + PIPE_W > 0);

  updateSkills();

  // Score passing
  world.pipes.forEach(p => { if (!p.passed && world.bird.x > p.x + PIPE_W) { p.passed = true; onScore(); } });

  // Collision — destroy pipe when dashing, ignore when invisible, die otherwise
  world.pipes.forEach(p => {
    if (collides(world.bird, p)) {
      if (dashing) {
        if (!p.destroyed) {
          p.destroyed = true;
          spawnPipeBreakParticles(p);
        }
      } else if (invisible) {
        // pass through safely
      } else {
        attemptDeath();
      }
    }
  });
  world.pipes = world.pipes.filter(p => !p.destroyed);

  if (world.bird.y + world.bird.r > H - 50 || world.bird.y - world.bird.r < 0) attemptDeath();
  world.frame++;
}
