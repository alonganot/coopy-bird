import { H, W } from '../../game/constants';
import { neonPanel } from '../../game/render/panel';
import { mpState } from '../mpState';

export function drawMpOverlay(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,8,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  const entries = (mpState.leaderboard ?? []).slice(0, 10);
  const panelH = 140 + Math.max(entries.length, 1) * 24;
  const panelY = H / 2 - panelH / 2;

  neonPanel(ctx, 36, panelY, W - 72, panelH, 12, '#ff4466');

  ctx.save();
  ctx.shadowBlur = 18;
  ctx.shadowColor = '#ff4466';
  ctx.fillStyle = '#ff4466';
  ctx.font = 'bold 24px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('MATCH OVER', W / 2, panelY + 38);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#f9ca24';
  ctx.font = 'bold 16px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText(`SHARED SCORE: ${mpState.score}`, W / 2, panelY + 62);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#7ecfff';
  ctx.font = 'bold 12px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('LEADERBOARD', W / 2, panelY + 84);
  ctx.restore();

  entries.forEach((e, i) => {
    const y = panelY + 106 + i * 24;
    ctx.save();
    if (i === 0) { ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca24'; }
    ctx.fillStyle = i === 0 ? '#f9ca24' : '#7ecfff99';
    ctx.font = `${i === 0 ? 'bold' : ''} 13px "Courier New"`;
    ctx.textAlign = 'center';
    ctx.fillText(`#${i + 1}  ${e.name} — ${e.score}`, W / 2, y);
    ctx.restore();
  });
}
