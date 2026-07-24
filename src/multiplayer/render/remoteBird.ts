import { drawBird } from '../../game/render/bird';
import { SHOP_GLASSES, SHOP_HATS, SHOP_MASKS, SHOP_SHOES } from '../../game/shop/data';
import type { SnapshotPlayer } from '../../../server/protocol';
import { PLAYER_X } from '../mpState';
import { getSmoothedY } from './remoteSmoothing';

const BIRD_R = 18;

function drawNametag(ctx: CanvasRenderingContext2D, x: number, y: number, name: string, isYou: boolean): void {
  ctx.save();
  ctx.font = 'bold 10px "Courier New"';
  ctx.textAlign = 'center';
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = isYou ? '#f9ca24' : '#cde';
  ctx.fillText(name, x, y - BIRD_R - 12);
  ctx.restore();
}

function drawCloneMarker(ctx: CanvasRenderingContext2D, x: number, y: number, color: SnapshotPlayer['color']): void {
  ctx.save();
  ctx.globalAlpha = 0.5;
  ctx.shadowBlur = 10;
  ctx.shadowColor = color.glow;
  ctx.fillStyle = color.body;
  ctx.beginPath();
  ctx.ellipse(x, y, BIRD_R, BIRD_R - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawRemotePlayer(ctx: CanvasRenderingContext2D, p: SnapshotPlayer, tick: number, isYou: boolean, dtMs: number): void {
  if (p.clone?.alive) drawCloneMarker(ctx, PLAYER_X, p.clone.y, p.color);
  if (!p.alive) return; // dead-and-awaiting-respawn players are simply hidden; roster shows their status

  // Smooth away network jitter for remote players only — the local player's own bird
  // keeps using the raw snapshot value, so this adds no extra input-response lag on top
  // of the already-existing round-trip latency for their own jump.
  const renderY = isYou ? p.y : getSmoothedY(p.id, p.y, dtMs);

  const dashActive = (p.activeTimer.dash ?? 0) > 0;
  drawBird(ctx, {
    x: PLAYER_X,
    y: renderY,
    vy: p.vy,
    r: BIRD_R,
    thrustAnim: 0,
    color: p.color,
    idleBob: 0,
    effects: {
      shrink: (p.activeTimer.shrink ?? 0) > 0,
      invisible: (p.activeTimer.invisibility ?? 0) > 0,
      // Exact remaining-duration fraction isn't synced; full-intensity while active is an accepted v1 simplification.
      dash: dashActive ? { progress: 1 } : null,
    },
    props: {
      hat: SHOP_HATS.find(h => h.id === p.props.hat) ?? null,
      glasses: SHOP_GLASSES.find(g => g.id === p.props.glasses) ?? null,
      mask: SHOP_MASKS.find(m => m.id === p.props.mask) ?? null,
      shoe: SHOP_SHOES.find(s => s.id === p.props.shoe) ?? null,
    },
  });

  if (p.invulnerable || p.levitating) {
    ctx.save();
    ctx.globalAlpha = 0.4 + 0.4 * Math.abs(Math.sin(tick * 0.3));
    ctx.strokeStyle = p.levitating ? '#7fd8ff' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(PLAYER_X, renderY, BIRD_R + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawNametag(ctx, PLAYER_X, renderY, p.name, isYou);
}
