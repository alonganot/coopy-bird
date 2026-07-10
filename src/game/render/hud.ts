import { W } from '../constants';
import { SHOP_SKILLS } from '../skills/data';
import { isSkillVisuallyActive } from '../skills/skills';
import { skillState } from '../skills/state';
import { world } from '../state';
import { drawCoin } from './particles';

export function drawHUD(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.shadowBlur = 16;
  ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00f7ff';
  ctx.font = 'bold 40px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText(String(world.score), W / 2, 54);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#00f7ff55';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 28, 24);
  ctx.lineTo(W / 2 - 38, 24);
  ctx.lineTo(W / 2 - 38, 58);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2 + 28, 24);
  ctx.lineTo(W / 2 + 38, 24);
  ctx.lineTo(W / 2 + 38, 58);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(1,8,24,0.75)';
  ctx.strokeStyle = '#f9ca2450';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#f9ca2430';
  ctx.beginPath();
  ctx.roundRect(W - 100, 16, 78, 24, 12);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
  drawCoin(ctx, W - 40, 28, 11, 1);
  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#f9ca24';
  ctx.fillStyle = '#f9ca24';
  ctx.font = 'bold 16px "Courier New"';
  ctx.textAlign = 'right';
  ctx.fillText(String(world.gameData.totalCoins), W - 56, 34);
  ctx.restore();

  // Equipped skill charges (top left, stacked)
  if (world.state === 'play' || world.state === 'dead') {
    world.gameData.equippedOrder.forEach((id, row) => {
      const skill = SHOP_SKILLS.find(s => s.id === id)!;
      const y = 24 + row * 26;
      const active = isSkillVisuallyActive(skill.id);
      const charges = skillState.charges[skill.id];
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
