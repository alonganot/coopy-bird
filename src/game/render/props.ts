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

/**
 * Every mask style shares this base silhouette: a half-ellipse spanning the bird's
 * entire width (rx=18, matching the body radius) covering the top half of the head
 * only (from the crown down to just below eye height, flat edge at cy) — a proper
 * "mask stretched across the whole top of the face" rather than a small shape
 * floating over one side. Individual styles vary color/pattern/eye-slit treatment on
 * top of this shared shape.
 */
function domePath(ctx: CanvasRenderingContext2D, cy = -2, ry = 13, rx = 18): void {
  ctx.beginPath();
  ctx.ellipse(0, cy, rx, ry, 0, Math.PI, Math.PI * 2);
  ctx.closePath();
}

/**
 * Drawn last in drawBird() (after the eye/glasses/beak, right before the hat — see
 * bird.ts) so every style here can fully occlude/replace the eye rather than being
 * painted over by it.
 */
export function drawMask(ctx: CanvasRenderingContext2D, item: MaskItem, r: number): void {
  ctx.save();
  ctx.scale(r / 18, r / 18);
  ctx.fillStyle = item.primary;
  ctx.strokeStyle = item.accent;
  ctx.lineWidth = 1.2;

  switch (item.style) {
    case 'bandit':
      // Angled domino band centered on the eye (8,-5), piped edge, small ear straps.
      ctx.save();
      ctx.translate(8, -5);
      ctx.rotate(-0.15);
      ctx.beginPath();
      ctx.roundRect(-9, -6, 20, 11, 4);
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = item.accent;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 1.3, 0, Math.PI * 2);
      ctx.fillStyle = item.accent;
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = item.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-1, -9);
      ctx.lineTo(-14, -11);
      ctx.moveTo(-1, -2);
      ctx.lineTo(-13, 1);
      ctx.stroke();
      break;

    case 'carnival': {
      // Jester full-width dome: diamond checker pattern, punched eye cutouts, dangling bell.
      domePath(ctx, -2, 13);
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = item.accent;
      for (let row = -15; row < -2; row += 7) {
        for (let col = -18; col < 18; col += 7) {
          if (Math.round((row + col) / 7) % 2 === 0) {
            ctx.save();
            ctx.translate(col, row);
            ctx.rotate(Math.PI / 4);
            ctx.fillRect(-3.2, -3.2, 6.4, 6.4);
            ctx.restore();
          }
        }
      }
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.ellipse(8, -6, 3.4, 2.2, -0.2, 0, Math.PI * 2);
      ctx.ellipse(-6, -6, 3.4, 2.2, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.arc(16, -14, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(16, -11, 0.9, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'ninja': {
      // Full face wrap: dark cloth ellipse, glowing eye-slit band, fold lines, trailing tail.
      ctx.beginPath();
      ctx.ellipse(9, -3, 17, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = item.accent;
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.roundRect(0, -7, 18, 4, 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-4, 2);
      ctx.lineTo(20, 4);
      ctx.moveTo(-3, 6);
      ctx.lineTo(18, 8);
      ctx.stroke();
      ctx.fillStyle = item.primary;
      ctx.beginPath();
      ctx.moveTo(-8, -6);
      ctx.lineTo(-18, -10);
      ctx.lineTo(-16, -2);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'tribal': {
      // Carved wood mask: angular full-width polygon, diamond eye cutout, ceremonial accents.
      ctx.beginPath();
      ctx.moveTo(-17, -8);
      ctx.lineTo(-6, -15);
      ctx.lineTo(8, -16);
      ctx.lineTo(18, -12);
      ctx.lineTo(17, -2);
      ctx.lineTo(0, 3);
      ctx.lineTo(-17, -2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath();
      ctx.moveTo(3, -9);
      ctx.lineTo(8, -5);
      ctx.lineTo(3, -1);
      ctx.lineTo(-2, -5);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = item.accent;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(-14, -8);
      ctx.lineTo(-8, -11);
      ctx.moveTo(10, -3);
      ctx.lineTo(15, -6);
      ctx.stroke();
      ctx.fillStyle = item.accent;
      [[13, -11], [-12, -4], [12, 0]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 1.3, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'hero': {
      // Full cowl: pointed ear-tip silhouette over the whole head/face, gold eye + trim.
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.quadraticCurveTo(-8, -18, 2, -22);
      ctx.lineTo(0, -14);
      ctx.quadraticCurveTo(6, -20, 12, -14);
      ctx.lineTo(10, -20);
      ctx.quadraticCurveTo(20, -16, 22, -4);
      ctx.quadraticCurveTo(24, 6, 14, 9);
      ctx.lineTo(-2, 6);
      ctx.quadraticCurveTo(-8, 4, -6, -4);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = item.accent;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(8, -5, 8, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.quadraticCurveTo(-8, -18, 2, -22);
      ctx.stroke();
      break;
    }

    case 'plague': {
      // Full beak mask: face plate + extended curved beak, round goggle lens.
      ctx.beginPath();
      ctx.ellipse(6, -4, 13, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(14, -4);
      ctx.quadraticCurveTo(30, -8, 38, -2);
      ctx.quadraticCurveTo(30, 4, 14, 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.arc(7, -5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = item.primary;
      ctx.beginPath();
      ctx.arc(7, -5, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = item.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(7, -5, 6, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'robot': {
      // Full-width angular face plate, panel seams, glowing eye slit, vents, rivets.
      ctx.beginPath();
      ctx.moveTo(-18, -6);
      ctx.lineTo(-14, -14);
      ctx.lineTo(14, -14);
      ctx.lineTo(18, -6);
      ctx.lineTo(16, 1);
      ctx.lineTo(-16, 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-8, -14);
      ctx.lineTo(-9, 1);
      ctx.moveTo(8, -14);
      ctx.lineTo(9, 1);
      ctx.stroke();
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = item.accent;
      ctx.fillStyle = item.accent;
      ctx.beginPath();
      ctx.roundRect(-13, -8, 26, 4, 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.roundRect(10 + i * 3, -4, 2, 4, 1);
        ctx.fill();
      }
      ctx.fillStyle = item.accent;
      [[-15, -9], [15, -9], [-14, -1], [14, -1]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx, dy, 1, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'skull': {
      // Glowing ember skull: full skull + jaw, teeth, glowing ember sockets, crack highlights.
      ctx.beginPath();
      ctx.ellipse(8, -3, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-2, 4);
      ctx.lineTo(18, 4);
      ctx.lineTo(15, 11);
      ctx.lineTo(1, 11);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = item.accent;
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(i * 4.5, 4, 3, 4);
      }
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff6b1a';
      ctx.fillStyle = '#ff5e1a';
      ctx.beginPath();
      ctx.arc(3, -6, 3.2, 0, Math.PI * 2);
      ctx.arc(13, -6, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,140,66,0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(8, -14);
      ctx.lineTo(6, -2);
      ctx.moveTo(14, -8);
      ctx.lineTo(18, -2);
      ctx.stroke();
      break;
    }
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
