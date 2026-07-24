import { H, W } from '../constants';
import { drawShopButton } from '../shop/shop';
import { SHOP_SKILLS } from '../skills/data';
import { world } from '../state';
import { neonPanel } from './panel';

// Fully static — depends only on the fixed W/H constants — so it's cached once, lazily.
let vignetteGradCache: CanvasGradient | null = null;

export function drawOverlay(ctx: CanvasRenderingContext2D): void {
  if (world.state === 'idle') {
    neonPanel(ctx, 36, H / 2 - 100, W - 72, 210, 12);
    ctx.save();
    ctx.font = 'bold 30px "Courier New"';
    ctx.textAlign = 'center';
    if (world.glitchActive) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ff00cc';
      ctx.fillText('COOPY BIRD', W / 2 - 3, H / 2 - 58);
      ctx.fillStyle = '#00ffff';
      ctx.fillText('COOPY BIRD', W / 2 + 3, H / 2 - 58);
      ctx.globalAlpha = 1;
    }
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00f7ff';
    ctx.fillStyle = '#00f7ff';
    ctx.fillText('COOPY BIRD', W / 2, H / 2 - 58);
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    const blinkOn = Math.floor(world.tick / 28) % 2 === 0;
    ctx.fillStyle = blinkOn ? '#7ecfffaa' : '#7ecfff33';
    ctx.font = '11px "Courier New"';
    ctx.fillText('PRESS SPACE OR TAP', W / 2, H / 2 - 30);
    ctx.fillStyle = '#00f7ff44';
    ctx.font = '10px "Courier New"';
    const equippedHint = world.gameData.equippedOrder
      .map((id, i) => `[${i + 1}] ${SHOP_SKILLS.find(s => s.id === id)!.label.toUpperCase()}`)
      .join('   ') || 'VISIT SHOP TO UNLOCK SKILLS';
    ctx.fillText(equippedHint, W / 2, H / 2 - 14);
    ctx.restore();
    const best = world.gameData.highScores[0] || 0;
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#f9ca24';
    ctx.fillStyle = '#f9ca24';
    ctx.font = '12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(`BEST: ${best}    COINS: ${world.gameData.totalCoins}`, W / 2, H / 2 + 2);
    ctx.restore();
    drawShopButton(ctx);
  } else if (world.state === 'dead') {
    const panelH = 60 + Math.max(world.leaderboard.length, 1) * 28 + 80;
    const panelY = H / 2 - panelH / 2;
    if (!vignetteGradCache) {
      vignetteGradCache = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.75);
      vignetteGradCache.addColorStop(0, 'transparent');
      vignetteGradCache.addColorStop(1, 'rgba(200,0,30,0.22)');
    }
    ctx.fillStyle = vignetteGradCache;
    ctx.fillRect(0, 0, W, H);
    neonPanel(ctx, 36, panelY, W - 72, panelH, 12, '#ff4466');

    const top = panelY + 42;
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff4466';
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 28px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, top);
    ctx.restore();

    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#f9ca24';
    ctx.fillStyle = '#f9ca24';
    ctx.font = 'bold 16px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(`SCORE: ${world.score}   +${world.score} COINS`, W / 2, top + 28);
    ctx.restore();
    if (world.isNewBest) {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = 'rgba(8,20,8,0.95)';
      ctx.strokeStyle = '#f9ca24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(W - 100, panelY + 8, 64, 18, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f9ca24';
      ctx.shadowBlur = 4;
      ctx.font = 'bold 9px "Courier New"';
      ctx.textAlign = 'center';
      ctx.fillText('★ NEW BEST', W - 68, panelY + 21);
      ctx.restore();
    }
    ctx.save();
    ctx.strokeStyle = '#ff446633';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(52, top + 42);
    ctx.lineTo(W - 52, top + 42);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#7ecfff';
    ctx.font = 'bold 13px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('LEADERBOARD', W / 2, top + 56);

    world.leaderboard.forEach((e, i) => {
      ctx.save();
      if (i === 0) { ctx.shadowBlur = 8; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = i === 0 ? '#f9ca24' : '#7ecfff99';
      ctx.font = `${i === 0 ? 'bold' : ''} 13px "Courier New"`;
      ctx.textAlign = 'center';
      ctx.fillText(`#${i + 1}  ${e.name} — ${e.score}`, W / 2, top + 76 + i * 28);
      ctx.restore();
    });

    const restartBlink = Math.floor(world.tick / 28) % 2 === 0;
    ctx.fillStyle = restartBlink ? '#7ecfff77' : '#7ecfff22';
    ctx.font = '11px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('TAP OR SPACE TO RESTART', W / 2, top + 76 + Math.max(world.leaderboard.length, 1) * 28 + 10);
  }
}

export function drawScanlines(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.globalAlpha = 0.028;
  ctx.fillStyle = '#000';
  for (let y = 0; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1);
  }
  ctx.restore();
}
