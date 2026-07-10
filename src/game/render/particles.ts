import type { Particle, Projectile } from '../types';

export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#f9ca2488';
  const cg = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.1, x, y, r);
  cg.addColorStop(0, '#fff7a0');
  cg.addColorStop(0.5, '#f9ca24');
  cg.addColorStop(1, '#b8860b');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e6b80088';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(x - r * 0.25, y - r * 0.28, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  particles.forEach(p => {
    if (p.type === 'spark') {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color!;
      ctx.fillStyle = p.color!;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'debris') {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color!;
      ctx.fillStyle = p.color!;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (p.type === 'text') {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = '#f9ca24';
      ctx.font = 'bold 18px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('+1', p.x, p.y);
      ctx.restore();
    } else if (p.type === 'shimmer') {
      ctx.save();
      ctx.globalAlpha = p.life * 0.6;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color!;
      ctx.fillStyle = p.color!;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
}

export function drawProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  projectiles.forEach(pr => {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fdcb6e';
    ctx.fillStyle = '#fdcb6e';
    ctx.beginPath();
    ctx.ellipse(pr.x, pr.y, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
