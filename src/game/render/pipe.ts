import { GAP, H, PIPE_W } from '../constants';
import { getActivePipeItem } from '../shop/data';
import type { PipeItem } from '../shop/types';
import { world } from '../state';
import type { Pipe } from '../types';

export function drawPipe(ctx: CanvasRenderingContext2D, p: Pipe): void {
  ctx.save();
  if (p.sinking) ctx.globalAlpha = Math.max(0, p.sinkTimer! / p.sinkDuration!);
  p.glowPhase = (p.glowPhase || 0) + 0.04;
  const glow = 0.5 + 0.5 * Math.sin(p.glowPhase);
  const botY = p.topH + GAP;
  const item = getActivePipeItem(world.gameData);
  const capH = item.capH;
  const overhang = item.overhang;

  function drawBarrel(x: number, y: number, w: number, h: number) {
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    item.barrelColors.forEach(([pos, color]) => g.addColorStop(pos, color));
    ctx.fillStyle = g;
    ctx.strokeStyle = `rgba(${item.barrelGlow},${0.3 + glow * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.globalAlpha = 0.15 + glow * 0.1;
    ctx.fillStyle = item.stripeColor;
    ctx.fillRect(x + 2, y, 4, h);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.07;
    for (let ly = y; ly < y + h; ly += 8) {
      ctx.fillStyle = item.scanlineColor;
      ctx.fillRect(x, ly, w, 1);
    }
    ctx.restore();
  }

  function drawCap(x: number, y: number, ch: number, flip: boolean) {
    const capX = x - overhang;
    const capW = PIPE_W + overhang * 2;
    ctx.save();
    ctx.shadowBlur = 10 + glow * 12;
    ctx.shadowColor = `rgba(${item.capGlow},${0.4 + glow * 0.4})`;

    const g = ctx.createLinearGradient(capX, 0, capX + capW, 0);
    item.capColors.forEach(([pos, color]) => g.addColorStop(pos, color));
    ctx.fillStyle = g;
    ctx.strokeStyle = `rgba(${item.capGlow},${0.5 + glow * 0.4})`;
    ctx.lineWidth = 1.5;

    switch (item.capStyle) {
      case 'rounded':
        ctx.beginPath();
        ctx.roundRect(capX, y, capW, ch, 10);
        ctx.fill();
        ctx.stroke();
        break;
      case 'ringed-segments': {
        const segH = (ch - 4) / 3;
        for (let s = 0; s < 3; s++) {
          const sy = y + s * (segH + 2);
          ctx.beginPath();
          ctx.roundRect(capX, sy, capW, segH, 3);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }
      case 'crystal-spike': {
        ctx.beginPath();
        ctx.rect(capX, y, capW, ch);
        ctx.fill();
        ctx.stroke();
        const spikeCount = 5, spikeW = capW / spikeCount, spikeH = 8;
        const spikeY = flip ? y : y + ch;
        const dir = flip ? -1 : 1;
        ctx.fillStyle = item.capColors[item.capColors.length - 1][1];
        for (let s = 0; s < spikeCount; s++) {
          const sx = capX + s * spikeW;
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
        ctx.rect(capX, y, capW, ch);
        ctx.fill();
        ctx.stroke();
        const midX = capX + capW / 2, midY = y + ch / 2, dr = ch * 0.55;
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
        ctx.rect(capX, y, capW, ch);
        ctx.fill();
        ctx.stroke();
        ctx.save();
        ctx.beginPath();
        ctx.rect(capX, y, capW, ch);
        ctx.clip();
        const stripeW = 10;
        for (let sx = capX - ch; sx < capX + capW + ch; sx += stripeW * 2) {
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.moveTo(sx, y);
          ctx.lineTo(sx + stripeW, y);
          ctx.lineTo(sx + stripeW - ch, y + ch);
          ctx.lineTo(sx - ch, y + ch);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        break;
      }
      default: // 'straight'
        ctx.beginPath();
        ctx.rect(capX, y, capW, ch);
        ctx.fill();
        ctx.stroke();
    }

    ctx.strokeStyle = `rgba(${item.edgeGlow},${0.6 + glow * 0.3})`;
    ctx.lineWidth = 1;
    const edgeY = flip ? y : y + ch;
    ctx.beginPath();
    ctx.moveTo(capX, edgeY);
    ctx.lineTo(capX + capW, edgeY);
    ctx.stroke();
    ctx.restore();
  }

  drawBarrel(p.x, 0, PIPE_W, p.topH);
  drawCap(p.x, p.topH - capH, capH, false);
  drawBarrel(p.x, botY, PIPE_W, H - botY);
  drawCap(p.x, botY, capH, true);
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
