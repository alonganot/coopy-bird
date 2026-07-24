import { H, W } from '../../game/constants';
import { neonPanel } from '../../game/render/panel';
import { mpState, you } from '../mpState';

const TITLE_Y_OFFSET = 34;
const MESSAGE_Y_OFFSET = 56;
const PLAYERS_START_OFFSET = MESSAGE_Y_OFFSET + 32;
const PLAYER_ROW_H = 24;
const READY_GAP_ABOVE = 16;
const READY_H = 36;
const BOTTOM_PAD = 20;

function computeLayout() {
  const n = mpState.players.length;
  const panelH = PLAYERS_START_OFFSET + n * PLAYER_ROW_H + READY_GAP_ABOVE + READY_H + BOTTOM_PAD;
  const panelY = H / 2 - panelH / 2;
  return { n, panelH, panelY };
}

export function getReadyButtonRect() {
  const { n, panelY } = computeLayout();
  const y = panelY + PLAYERS_START_OFFSET + n * PLAYER_ROW_H + READY_GAP_ABOVE;
  return { x: W / 2 - 60, y, w: 120, h: READY_H };
}

export function drawLobby(ctx: CanvasRenderingContext2D): void {
  const players = mpState.players;
  const { panelH, panelY } = computeLayout();

  neonPanel(ctx, 36, panelY, W - 72, panelH + 50, 12, '#00f7ff');

  ctx.save();
  ctx.shadowBlur = 14;
  ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00f7ff';
  ctx.font = 'bold 20px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('MULTIPLAYER LOBBY', W / 2, panelY + TITLE_Y_OFFSET);
  ctx.restore();

  const message = mpState.phase === 'waiting'
    ? 'WAITING FOR PLAYERS...'
    : mpState.phase === 'countdown'
      ? 'STARTING...'
      : 'TAP READY TO START — WAITING FOR EVERYONE';

  ctx.save();
  ctx.fillStyle = '#7ecfff';
  ctx.font = '12px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText(message, W / 2, panelY + MESSAGE_Y_OFFSET);
  ctx.restore();

  players.forEach((p, i) => {
    const y = panelY + PLAYERS_START_OFFSET + i * PLAYER_ROW_H;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Courier New"';
    ctx.fillStyle = p.id === mpState.you ? '#f9ca24' : '#cde';
    ctx.fillText(p.name, 56, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = p.ready ? '#00ffa0' : '#ff4466';
    ctx.fillText(p.ready ? 'READY' : 'NOT READY', W - 56, y);
    ctx.restore();
  });

  if (mpState.phase === 'countdown' && mpState.countdownInMs !== null) {
    const secsLeft = Math.max(0, Math.ceil(mpState.countdownInMs / 1000));
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f9ca24';
    ctx.fillStyle = '#f9ca24';
    ctx.font = 'bold 32px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(String(secsLeft), W / 2, panelY - 16);
    ctx.restore();
    return;
  }

  const me = you();
  const r = getReadyButtonRect();
  ctx.save();
  ctx.fillStyle = me?.ready ? 'rgba(0,255,160,0.18)' : 'rgba(1,8,24,0.85)';
  ctx.strokeStyle = me?.ready ? '#00ffa0' : '#00f7ff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = me?.ready ? '#00ffa0' : '#00f7ff';
  ctx.font = 'bold 13px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText(me?.ready ? 'READY!' : 'TAP TO READY', r.x + r.w / 2, r.y + r.h / 2 + 5);
  ctx.restore();
}
