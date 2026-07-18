import { fetchLeaderboard, submitScore } from './api';
import { GAP, H, PIPE_W } from './constants';
import { getActiveColorItem } from './shop/data';
import { SHOP_SKILLS } from './skills/data';
import { isSkillEquipped } from './skills/skills';
import { skillState } from './skills/state';
import { saveData, world } from './state';
import type { Pipe } from './types';

export function spawnPipeBreakParticles(p: Pipe): void {
  const cx = p.x + PIPE_W / 2;
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 5;
    world.particles.push({ x: cx, y: world.bird.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 1, life: 1, type: 'debris', color: '#00ff88' });
  }
  // Flash shards
  for (let i = 0; i < 8; i++) {
    world.particles.push({ x: cx, y: p.topH / 2, vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3, life: 1, type: 'spark', color: '#aaffcc' });
    world.particles.push({ x: cx, y: p.topH + GAP + (H - p.topH - GAP) / 2, vx: (Math.random() - 0.5) * 4, vy: -Math.random() * 3, life: 1, type: 'spark', color: '#aaffcc' });
  }
}

export function onScore(): void {
  world.score++;
  world.gameData.totalCoins += skillState.clone && skillState.clone.alive ? 2 : 1;
  saveData();
  SHOP_SKILLS.forEach(s => {
    if (isSkillEquipped(s.id) && world.score % s.chargeThreshold === 0) skillState.charges[s.id]++;
  });
  const col = getActiveColorItem(world.gameData);
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 / 12) * i;
    world.particles.push({ x: world.bird.x, y: world.bird.y, vx: Math.cos(angle) * 3.5, vy: Math.sin(angle) * 3.5, life: 1, type: 'spark', color: col.body });
  }
  world.particles.push({ x: world.bird.x, y: world.bird.y - 20, vy: -1.5, life: 1, type: 'text' });
}

export function onDeath(): void {
  if (world.state === 'dead') return;
  world.state = 'dead';
  const prevBest = world.gameData.highScores[0] !== undefined ? world.gameData.highScores[0] : -1;
  world.gameData.highScores.push(world.score);
  world.gameData.highScores.sort((a, b) => b - a);
  world.gameData.highScores = world.gameData.highScores.slice(0, 5);
  world.isNewBest = world.score > 0 && world.score > prevBest;
  saveData();
  submitScore(world.username, world.score);
  fetchLeaderboard('singleplayer')
    .then(entries => { world.leaderboard = entries; })
    .catch(err => console.error('Failed to fetch leaderboard:', err));
  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 / 24) * i;
    const spd = 2 + Math.random() * 4;
    world.particles.push({ x: world.bird.x, y: world.bird.y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd - 2, life: 1, type: 'debris', color: getActiveColorItem(world.gameData).body });
  }
}
