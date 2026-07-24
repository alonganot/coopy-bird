import { GAP, H, PIPE_W } from '../constants';
import { getActivePipeItem } from '../shop/data';
import type { PipeItem } from '../shop/types';
import { world } from '../state';
import type { Pipe } from '../types';

// Barrel/cap gradients only vary with the equipped pipe skin, not the pipe's scrolling
// x position — cached in LOCAL coordinates (origin-relative) and keyed by the stable
// PipeItem reference from SHOP_PIPES, positioned per-draw via ctx.translate instead of
// baking the absolute x into the gradient every frame.
const barrelGradCache = new WeakMap<PipeItem, CanvasGradient>();
const capGradCache = new WeakMap<PipeItem, CanvasGradient>();

// renderX optionally overrides p.x for positioning only (multiplayer's client-side
// smoothing of the pipe's scrolling position) — everything else (glow-phase animation
// state, mutated in place on p, topH, sinking) is unaffected and still reads from p.
export function drawPipe(ctx: CanvasRenderingContext2D, p: Pipe, renderX?: number): void {
  const x = renderX ?? p.x;
  ctx.save();
  if (p.sinking) ctx.globalAlpha = Math.max(0, p.sinkTimer! / p.sinkDuration!);
  p.glowPhase = (p.glowPhase || 0) + 0.04;
  const glow = 0.5 + 0.5 * Math.sin(p.glowPhase);
  const botY = p.topH + GAP;
  const item = getActivePipeItem(world.gameData);
  const capH = item.capH;
  const overhang = item.overhang;

  function drawBarrel(x: number, y: number, w: number, h: number) {
    let g = barrelGradCache.get(item);
    if (!g) {
      g = ctx.createLinearGradient(0, 0, w, 0);
      item.barrelColors.forEach(([pos, color]) => g!.addColorStop(pos, color));
      barrelGradCache.set(item, g);
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = g;
    ctx.strokeStyle = `rgba(${item.barrelGlow},${0.3 + glow * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.15 + glow * 0.1;
    ctx.fillStyle = item.stripeColor;
    ctx.fillRect(2, 0, 4, h);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.07;
    for (let ly = 0; ly < h; ly += 8) {
      ctx.fillStyle = item.scanlineColor;
      ctx.fillRect(0, ly, w, 1);
    }
    ctx.restore();
    ctx.restore();
  }

  function drawCap(x: number, y: number, ch: number, flip: boolean) {
    const capX = x - overhang;
    const capW = PIPE_W + overhang * 2;
    let g = capGradCache.get(item);
    if (!g) {
      g = ctx.createLinearGradient(0, 0, capW, 0);
      item.capColors.forEach(([pos, color]) => g!.addColorStop(pos, color));
      capGradCache.set(item, g);
    }
    ctx.save();
    ctx.translate(capX, y);
    ctx.shadowBlur = 10 + glow * 12;
    ctx.shadowColor = `rgba(${item.capGlow},${0.4 + glow * 0.4})`;

    ctx.fillStyle = g;
    ctx.strokeStyle = `rgba(${item.capGlow},${0.5 + glow * 0.4})`;
    ctx.lineWidth = 1.5;

    switch (item.capStyle) {
      case 'rounded':
        ctx.beginPath();
        ctx.roundRect(0, 0, capW, ch, 10);
        ctx.fill();
        ctx.stroke();
        break;
      case 'ringed-segments': {
        const segH = (ch - 4) / 3;
        for (let s = 0; s < 3; s++) {
          const sy = s * (segH + 2);
          ctx.beginPath();
          ctx.roundRect(0, sy, capW, segH, 3);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }
      case 'crystal-spike': {
        ctx.beginPath();
        ctx.rect(0, 0, capW, ch);
        ctx.fill();
        ctx.stroke();
        const spikeCount = 5, spikeW = capW / spikeCount, spikeH = 8;
        const spikeY = flip ? 0 : ch;
        const dir = flip ? -1 : 1;
        ctx.fillStyle = item.capColors[item.capColors.length - 1][1];
        for (let s = 0; s < spikeCount; s++) {
          const sx = s * spikeW;
          ctx.beginPath();
          ctx.moveTo(sx, spikeY);
          ctx.lineTo(sx + spikeW / 2, spikeY + dir * spikeH);
          ctx.lineTo(sx + spikeW, spikeY);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }
      case 'diamond-notch': {
        ctx.beginPath();
        ctx.rect(0, 0, capW, ch);
        ctx.fill();
        ctx.stroke();
        const midX = capW / 2, midY = ch / 2, dr = ch * 0.55;
        ctx.fillStyle = item.stripeColor;
        ctx.beginPath();
        ctx.moveTo(midX, midY - dr);
        ctx.lineTo(midX + dr, midY);
        ctx.lineTo(midX, midY + dr);
        ctx.lineTo(midX - dr, midY);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'hazard-stripe': {
        ctx.beginPath();
        ctx.rect(0, 0, capW, ch);
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, capW, ch);
        ctx.clip();
        const stripeW = 10;
        for (let sx = -ch; sx < capW + ch; sx += stripeW * 2) {
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx + stripeW, 0);
          ctx.lineTo(sx + stripeW - ch, ch);
          ctx.lineTo(sx - ch, ch);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        break;
      }
      default: // 'straight'
        ctx.beginPath();
        ctx.rect(0, 0, capW, ch);
        ctx.fill();
        ctx.stroke();
    }

    ctx.strokeStyle = `rgba(${item.edgeGlow},${0.6 + glow * 0.3})`;
    ctx.lineWidth = 1;
    const edgeY = flip ? 0 : ch;
    ctx.beginPath();
    ctx.moveTo(0, edgeY);
    ctx.lineTo(capW, edgeY);
    ctx.stroke();
    ctx.restore();
  }

  drawBarrel(x, 0, PIPE_W, p.topH);
  drawCap(x, p.topH - capH, capH, false);
  drawBarrel(x, botY, PIPE_W, H - botY);
  drawCap(x, botY, capH, true);
  ctx.restore();
}

export function drawPipePreview(ctx: CanvasRenderingContext2D, item: PipeItem, x: number, y: number): void {
  ctx.save();
  ctx.translate(x, y);
  const barrelG = ctx.createLinearGradient(-9, 0, 9, 0);
  item.barrelColors.forEach(([pos, color]) => barrelG.addColorStop(pos, color));
  ctx.fillStyle = barrelG;
  ctx.fillRect(-9, -16, 18, 32);
  const capG = ctx.createLinearGradient(-12, 0, 12, 0);
  item.capColors.forEach(([pos, color]) => capG.addColorStop(pos, color));
  ctx.fillStyle = capG;
  ctx.strokeStyle = `rgba(${item.capGlow},0.9)`;
  ctx.lineWidth = 1;
  switch (item.capStyle) {
    case 'rounded':
      ctx.beginPath();
      ctx.roundRect(-12, 12, 24, 10, 5);
      ctx.fill();
      ctx.stroke();
      break;
    case 'ringed-segments':
      for (let s = 0; s < 3; s++) {
        ctx.beginPath();
        ctx.roundRect(-12, 12 + s * 4, 24, 2.6, 1);
        ctx.fill();
        ctx.stroke();
      }
      break;
    case 'crystal-spike':
      ctx.beginPath();
      ctx.rect(-12, 12, 24, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = item.capColors[item.capColors.length - 1][1];
      for (let s = 0; s < 4; s++) {
        const sx = -12 + s * 6;
        ctx.beginPath();
        ctx.moveTo(sx, 12);
        ctx.lineTo(sx + 3, 8);
        ctx.lineTo(sx + 6, 12);
        ctx.closePath();
        ctx.fill();
      }
      break;
    default:
      ctx.beginPath();
      ctx.rect(-12, 12, 24, 10);
      ctx.fill();
      ctx.stroke();
      if (item.capStyle === 'diamond-notch') {
        ctx.fillStyle = item.stripeColor;
        ctx.beginPath();
        ctx.moveTo(0, 13);
        ctx.lineTo(4, 17);
        ctx.lineTo(0, 21);
        ctx.lineTo(-4, 17);
        ctx.closePath();
        ctx.fill();
      } else if (item.capStyle === 'hazard-stripe') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(-12, 12, 24, 10);
        ctx.clip();
        for (let sx = -20; sx < 20; sx += 8) {
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.moveTo(sx, 12);
          ctx.lineTo(sx + 4, 12);
          ctx.lineTo(sx, 22);
          ctx.lineTo(sx - 4, 22);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
  }
  ctx.restore();
}
