import { W } from '../../game/constants';
import { SHOP_SKILLS, type SkillId } from '../../game/skills/data';
import type { SnapshotPlayer } from '../../../server/protocol';
import { mpState, you } from '../mpState';

function isVisuallyActive(p: SnapshotPlayer, id: SkillId): boolean {
  if (id === 'shadowClone') return !!(p.clone && p.clone.alive);
  return (p.activeTimer[id] ?? 0) > 0;
}

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

  // Equipped skill charges (top left, stacked) — mirrors single-player's drawHUD
  const me = you();
  if (me && mpState.phase === 'playing') {
    me.equippedOrder.forEach((id, row) => {
      const skill = SHOP_SKILLS.find(s => s.id === id)!;
      const y = 24 + row * 26;
      const active = isVisuallyActive(me, id);
      const charges = me.charges[id] ?? 0;
      ctx.save();
      ctx.shadowBlur = active ? 16 : 6;
      ctx.shadowColor = active ? skill.color : '#ffffff55';
      ctx.fillStyle = active ? skill.color : charges > 0 ? '#cceeff' : '#334455';
      ctx.font = 'bold 13px "Courier New"';
      ctx.textAlign = 'left';
      ctx.fillText(`${skill.label.toUpperCase()} [${row + 1}]`, 12, y);

      for (let i = 0; i < Math.max(charges + (active ? 1 : 0), 3); i++) {
        const filled = i < charges || (active && i === 0);
        ctx.shadowBlur = filled ? 10 : 2;
        ctx.shadowColor = skill.color;
        ctx.fillStyle = filled ? (active && i === 0 ? '#ffffff' : skill.color) : '#1a2a33';
        ctx.strokeStyle = filled ? skill.color + 'aa' : '#334455';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(12 + i * 14, y + 6, 10, 8, 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    });
  }
}
