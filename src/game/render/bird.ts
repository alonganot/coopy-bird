import type { GlassesItem, HatItem, MaskItem, ShoeItem } from '../shop/types';
import { drawGlasses, drawHat, drawMask, drawShoes } from './props';

export interface BirdColor {
  body: string;
  wing: string;
  glow: string;
}

export interface BirdEffects {
  shrink: boolean;
  invisible: boolean;
  dash: { progress: number } | null;
}

export interface BirdProps {
  hat: HatItem | null;
  glasses: GlassesItem | null;
  mask: MaskItem | null;
  shoe: ShoeItem | null;
}

export interface BirdRenderParams {
  x: number;
  y: number;
  vy: number;
  r: number;
  thrustAnim: number;
  color: BirdColor;
  idleBob: number;
  effects: BirdEffects;
  props?: BirdProps;
}

// Sheen and dash-streak gradients depend only on the bird radius (always 18 in practice,
// both single-player's state.ts and multiplayer's remoteBird.ts BIRD_R), not on position
// or color — cached lazily and rebuilt only if r ever changes, cheap insurance either way.
let sheenGradCache: CanvasGradient | null = null;
let sheenGradR = -1;
let dashStreakGradCache: CanvasGradient | null = null;
let dashStreakGradR = -1;

export function drawBird(ctx: CanvasRenderingContext2D, p: BirdRenderParams): void {
  const col = p.color;
  ctx.save();
  ctx.translate(p.x, p.y + p.idleBob);
  const angle = Math.max(-0.5, Math.min(Math.PI / 4, p.vy * 0.05));
  ctx.rotate(angle);
  const shrinkScale = p.effects.shrink ? 0.5 : 1;
  ctx.scale(shrinkScale, shrinkScale);

  if (p.thrustAnim > 0) {
    const tg = ctx.createRadialGradient(-p.r - 5, 0, 0, -p.r - 5, 0, 20 * p.thrustAnim);
    tg.addColorStop(0, col.body + 'ff');
    tg.addColorStop(0.4, col.wing + '99');
    tg.addColorStop(1, 'transparent');
    ctx.save();
    ctx.globalAlpha = p.thrustAnim;
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.ellipse(-p.r - 5, 0, 20 * p.thrustAnim, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Dash trail — ghost copies streaking behind
  if (p.effects.dash) {
    const progress = p.effects.dash.progress;
    for (let i = 1; i <= 5; i++) {
      ctx.save();
      ctx.globalAlpha = (0.18 * progress) * (1 - i / 6);
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f7ff';
      ctx.fillStyle = '#00f7ff';
      ctx.beginPath();
      ctx.ellipse(-i * 14, 0, p.r, p.r - 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Full-width horizontal streak
    ctx.save();
    ctx.globalAlpha = 0.25 * progress;
    if (!dashStreakGradCache || dashStreakGradR !== p.r) {
      dashStreakGradCache = ctx.createLinearGradient(-p.r - 80, 0, -p.r, 0);
      dashStreakGradCache.addColorStop(0, 'transparent');
      dashStreakGradCache.addColorStop(1, '#00f7ffcc');
      dashStreakGradR = p.r;
    }
    ctx.fillStyle = dashStreakGradCache;
    ctx.fillRect(-p.r - 80, -5, 80, 10);
    ctx.restore();
  }

  ctx.save();
  const invisActive = p.effects.invisible;
  if (invisActive) ctx.globalAlpha = 0.4;
  ctx.shadowBlur = 18;
  ctx.shadowColor = invisActive ? '#a29bfe' : col.glow;
  ctx.fillStyle = invisActive ? '#a29bfe' : col.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.r, p.r - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!sheenGradCache || sheenGradR !== p.r) {
    sheenGradCache = ctx.createRadialGradient(-4, -6, 1, 0, 0, p.r);
    sheenGradCache.addColorStop(0, 'rgba(255,255,255,0.35)');
    sheenGradCache.addColorStop(1, 'rgba(255,255,255,0)');
    sheenGradR = p.r;
  }
  ctx.fillStyle = sheenGradCache;
  ctx.beginPath();
  ctx.ellipse(0, 0, p.r, p.r - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (p.props?.shoe) drawShoes(ctx, p.props.shoe, p.r);
  if (p.props?.mask) drawMask(ctx, p.props.mask, p.r);

  ctx.fillStyle = col.wing;
  ctx.beginPath();
  ctx.ellipse(-4, 5, 10, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, -2);
  ctx.lineTo(6, -2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6, 3);
  ctx.lineTo(4, 3);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00eeff';
  ctx.beginPath();
  ctx.arc(8, -5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#001a22';
  ctx.beginPath();
  ctx.arc(9.5, -5, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(7, -7, 1.5, 0, Math.PI * 2);
  ctx.fill();

  if (p.props?.glasses) drawGlasses(ctx, p.props.glasses, p.r);

  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.moveTo(14, -3);
  ctx.lineTo(23, 0);
  ctx.lineTo(14, 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.moveTo(14, -3);
  ctx.lineTo(23, 0);
  ctx.lineTo(14, 0);
  ctx.closePath();
  ctx.fill();

  if (p.props?.hat) drawHat(ctx, p.props.hat, p.r);

  ctx.restore();
}
