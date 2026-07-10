import { W } from '../../game/constants';
import { mpState } from '../mpState';

export function drawMpHud(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00f7ff';
  ctx.font = 'bold 36px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText(String(mpState.score), W / 2, 50);
  ctx.restore();

  ctx.save();
  ctx.font = 'bold 11px "Courier New"';
  mpState.players.forEach((p, i) => {
    const y = 20 + i * 16;
    ctx.textAlign = 'left';
    ctx.fillStyle = p.alive ? '#00ffa0' : '#ff4466';
    ctx.fillText(p.alive ? '●' : '✕', W - 110, y);
    ctx.fillStyle = p.id === mpState.you ? '#f9ca24' : '#cde';
    ctx.fillText(p.name.slice(0, 10), W - 98, y);
  });
  ctx.restore();
}
