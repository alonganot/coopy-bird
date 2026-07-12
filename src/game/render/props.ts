import type { GlassesItem, HatItem, MaskItem, ShoeItem } from '../shop/types';

/**
 * All props are drawn inside drawBird()'s already-translated/rotated/(shrink-)scaled local
 * space, at fixed offsets relative to the body ellipse (centered at 0,0, r~18) and the eye
 * (at 8,-5 r6) — so they automatically inherit the bird's pitch and Shrink-skill scale.
 */

export function drawHat(ctx: CanvasRenderingContext2D, item: HatItem, r: number): void {
  ctx.save();
  ctx.scale(r / 18, r / 18);
  ctx.fillStyle = item.primary;
  ctx.strokeStyle = item.accent;
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 6;
  ctx.shadowColor = item.primary;

  switch (item.style) {
    case 'cap':
      ctx.beginPath();
      ctx.ellipse(2, -14, 11, 6, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-8, -12, 5, 3, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = item.accent;
      ctx.fill();
      break;
    case 'top-hat':
      ctx.fillRect(-4, -30, 14, 16);
      ctx.beginPath();
      ctx.ellipse(3, -14, 13, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = item.accent;
      ctx.fillRect(-4, -18, 14, 3);
      break;
    case 'beanie':
      ctx.beginPath();
      ctx.ellipse(2, -15, 12, 9, 0, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = item.accent;
      ctx.fillRect(-10, -16, 24, 4);
      ctx.beginPath();
      ctx.arc(2, -24, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'crown':
      ctx.beginPath();
      ctx.moveTo(-9, -14);
      ctx.lineTo(-9, -22);
      ctx.lineTo(-4, -16);
      ctx.lineTo(2, -24);
      ctx.lineTo(8, -16);
      ctx.lineTo(13, -22);
      ctx.lineTo(13, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.arc(2, -22, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'headband':
      ctx.beginPath();
      ctx.ellipse(2, -13, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.arc(-6, -13, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'party':
      ctx.beginPath();
      ctx.moveTo(-8, -13);
      ctx.lineTo(13, -13);
      ctx.lineTo(3, -32);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.arc(3, -32, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-2, -20, 1.5, 0, Math.PI * 2);
      ctx.arc(7, -22, 1.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'helmet':
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(2, -6, 16, 16, 0, Math.PI * 1.15, Math.PI * 1.95);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = item.accent;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.ellipse(9, -6, 8, 9, 0, Math.PI * 1.2, Math.PI * 1.9);
      ctx.fill();
      break;
    case 'halo':
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = item.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(2, -22, 10, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

export function drawGlasses(ctx: CanvasRenderingContext2D, item: GlassesItem, r: number): void {
  ctx.save();
  ctx.scale(r / 18, r / 18);
  ctx.strokeStyle = item.frame;
  ctx.fillStyle = item.lens;
  ctx.lineWidth = 1.5;
  const ex = 8, ey = -5;

  switch (item.style) {
    case 'round':
      ctx.beginPath();
      ctx.arc(ex, ey, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'square':
      ctx.beginPath();
      ctx.roundRect(ex - 6, ey - 6, 12, 12, 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'aviator':
      ctx.beginPath();
      ctx.ellipse(ex, ey + 1, 7, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex - 7, ey - 4);
      ctx.lineTo(ex + 10, ey - 6);
      ctx.stroke();
      break;
    case 'visor':
      ctx.beginPath();
      ctx.roundRect(ex - 8, ey - 5, 18, 8, 4);
      ctx.fill();
      ctx.stroke();
      break;
    case 'monocle':
      ctx.beginPath();
      ctx.arc(ex, ey, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex + 5, ey + 4);
      ctx.lineTo(ex + 9, ey + 12);
      ctx.stroke();
      break;
    case 'ski':
      ctx.beginPath();
      ctx.ellipse(ex + 1, ey, 9, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    case 'star': {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const innerAng = ang + Math.PI / 5;
        const ox = ex + Math.cos(ang) * 7, oy = ey + Math.sin(ang) * 7;
        const ix = ex + Math.cos(innerAng) * 3, iy = ey + Math.sin(innerAng) * 3;
        if (i === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'heart':
      ctx.beginPath();
      ctx.moveTo(ex, ey + 5);
      ctx.bezierCurveTo(ex - 9, ey - 3, ex - 4, ey - 9, ex, ey - 3);
      ctx.bezierCurveTo(ex + 4, ey - 9, ex + 9, ey - 3, ex, ey + 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
  }
  ctx.restore();
}

export function drawMask(ctx: CanvasRenderingContext2D, item: MaskItem, r: number): void {
  ctx.save();
  ctx.scale(r / 18, r / 18);
  ctx.fillStyle = item.primary;
  ctx.strokeStyle = item.accent;
  ctx.lineWidth = 1.2;

  switch (item.style) {
    case 'bandit':
      ctx.beginPath();
      ctx.roundRect(-2, -9, 18, 8, 3);
      ctx.fill();
      break;
    case 'ninja':
      ctx.beginPath();
      ctx.roundRect(-3, -10, 20, 16, 3);
      ctx.fill();
      break;
    case 'hero':
      ctx.beginPath();
      ctx.ellipse(8, -6, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = item.accent;
      ctx.stroke();
      break;
    case 'robot':
      ctx.beginPath();
      ctx.roundRect(-1, -9, 17, 9, 2);
      ctx.fill();
      ctx.fillStyle = item.accent;
      ctx.fillRect(3, -6, 9, 3);
      break;
    case 'skull':
      ctx.beginPath();
      ctx.ellipse(6, -5, 11, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.arc(2, -6, 2, 0, Math.PI * 2);
      ctx.arc(11, -6, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'plague':
      ctx.beginPath();
      ctx.ellipse(4, -4, 8, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(20, -2, 5, 3, -0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'carnival':
      ctx.beginPath();
      ctx.ellipse(6, -6, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.moveTo(16, -10);
      ctx.lineTo(24, -14);
      ctx.lineTo(22, -6);
      ctx.closePath();
      ctx.fill();
      break;
    case 'tribal':
      ctx.beginPath();
      ctx.moveTo(-2, -9);
      ctx.lineTo(16, -9);
      ctx.lineTo(10, -1);
      ctx.lineTo(4, -1);
      ctx.closePath();
      ctx.fill();
      break;
  }
  ctx.restore();
}

export function drawShoes(ctx: CanvasRenderingContext2D, item: ShoeItem, r: number): void {
  ctx.save();
  ctx.fillStyle = item.primary;
  ctx.strokeStyle = item.sole;
  ctx.lineWidth = 2;

  const drawFoot = (fx: number) => {
    switch (item.style) {
      case 'sneaker':
      case 'boot':
      case 'armor':
        ctx.beginPath();
        ctx.roundRect(fx, r - 7, 8, 5, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(fx, r - 2);
        ctx.lineTo(fx + 8, r - 2);
        ctx.stroke();
        break;
      case 'sandal':
      case 'ballet':
        ctx.beginPath();
        ctx.ellipse(fx + 4, r - 5, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'cleats':
        ctx.beginPath();
        ctx.roundRect(fx, r - 7, 8, 5, 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(fx + 1, r - 2, 1, 0, Math.PI * 2);
        ctx.arc(fx + 4, r - 2, 1, 0, Math.PI * 2);
        ctx.arc(fx + 7, r - 2, 1, 0, Math.PI * 2);
        ctx.fillStyle = item.sole;
        ctx.fill();
        ctx.fillStyle = item.primary;
        break;
      case 'roller':
        ctx.beginPath();
        ctx.roundRect(fx, r - 7, 8, 4, 2);
        ctx.fill();
        ctx.fillStyle = item.sole;
        ctx.beginPath();
        ctx.arc(fx + 1.5, r - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(fx + 6.5, r - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = item.primary;
        break;
      case 'clown':
        ctx.beginPath();
        ctx.ellipse(fx + 5, r - 4, 8, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
    }
  };

  drawFoot(-9);
  drawFoot(1);
  ctx.restore();
}
