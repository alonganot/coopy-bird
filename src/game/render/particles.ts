import type { Particle, Projectile } from '../types';

// The coin icon's color stops only depend on its radius (a small, fixed set of values
// across all call sites — HUD icon + shop price icons) — cached by radius, drawn in
// local coordinates and positioned via ctx.translate so the cache is position-independent.
const coinGradCache = new Map<number, CanvasGradient>();

export function drawCoin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#f9ca2488';
  let cg = coinGradCache.get(r);
  if (!cg) {
    cg = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
    cg.addColorStop(0, '#fff7a0');
    cg.addColorStop(0.5, '#f9ca24');
    cg.addColorStop(1, '#b8860b');
    coinGradCache.set(r, cg);
  }
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e6b80088';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.28, r * 0.32, 0, Math.PI * 2);
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
