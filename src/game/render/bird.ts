import { getActiveColorItem } from '../shop/data';
import { SHOP_SKILLS } from '../skills/data';
import { isSkillActive } from '../skills/skills';
import { skillState } from '../skills/state';
import { world } from '../state';

export function drawBird(ctx: CanvasRenderingContext2D): void {
  const b = world.bird;
  const col = getActiveColorItem(world.gameData);
  ctx.save();
  const idleBob = world.state === 'idle' ? Math.sin(world.tick * 0.05) * 6 : 0;
  ctx.translate(b.x, b.y + idleBob);
  const angle = Math.max(-0.5, Math.min(Math.PI / 4, b.vy * 0.05));
  ctx.rotate(angle);
  const shrinkScale = isSkillActive('shrink') ? 0.5 : 1;
  ctx.scale(shrinkScale, shrinkScale);

  if (b.thrustAnim > 0) {
    b.thrustAnim = Math.max(0, b.thrustAnim - 0.08);
    const tg = ctx.createRadialGradient(-b.r - 5, 0, 0, -b.r - 5, 0, 20 * b.thrustAnim);
    tg.addColorStop(0, col.body + 'ff');
    tg.addColorStop(0.4, col.wing + '99');
    tg.addColorStop(1, 'transparent');
    ctx.save();
    ctx.globalAlpha = b.thrustAnim;
    ctx.fillStyle = tg;
    ctx.beginPath();
    ctx.ellipse(-b.r - 5, 0, 20 * b.thrustAnim, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Dash trail — ghost copies streaking behind
  if (isSkillActive('dash')) {
    const dashSkill = SHOP_SKILLS.find(s => s.id === 'dash')!;
    const progress = skillState.activeTimer.dash / dashSkill.duration;
    for (let i = 1; i <= 5; i++) {
      ctx.save();
      ctx.globalAlpha = (0.18 * progress) * (1 - i / 6);
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f7ff';
      ctx.fillStyle = '#00f7ff';
      ctx.beginPath();
      ctx.ellipse(-i * 14, 0, b.r, b.r - 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    // Full-width horizontal streak
    ctx.save();
    ctx.globalAlpha = 0.25 * progress;
    const sg = ctx.createLinearGradient(-b.r - 80, 0, -b.r, 0);
    sg.addColorStop(0, 'transparent');
    sg.addColorStop(1, '#00f7ffcc');
    ctx.fillStyle = sg;
    ctx.fillRect(-b.r - 80, -5, 80, 10);
    ctx.restore();
  }

  ctx.save();
  const invisActive = isSkillActive('invisibility');
  if (invisActive) ctx.globalAlpha = 0.4;
  ctx.shadowBlur = 18;
  ctx.shadowColor = invisActive ? '#a29bfe' : col.glow;
  ctx.fillStyle = invisActive ? '#a29bfe' : col.body;
  ctx.beginPath();
  ctx.ellipse(0, 0, b.r, b.r - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  const sheen = ctx.createRadialGradient(-4, -6, 1, 0, 0, b.r);
  sheen.addColorStop(0, 'rgba(255,255,255,0.35)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.ellipse(0, 0, b.r, b.r - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = col.wing;
  ctx.beginPath();
  ctx.ellipse(-4, 5, 10, 6, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-8, -2);
  ctx.lineTo(6, -2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-6, 3);
  ctx.lineTo(4, 3);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00eeff';
  ctx.beginPath();
  ctx.arc(8, -5, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#001a22';
  ctx.beginPath();
  ctx.arc(9.5, -5, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.arc(7, -7, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ff8c42';
  ctx.beginPath();
  ctx.moveTo(14, -3);
  ctx.lineTo(23, 0);
  ctx.lineTo(14, 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.moveTo(14, -3);
  ctx.lineTo(23, 0);
  ctx.lineTo(14, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
