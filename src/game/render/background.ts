import { H, SPEED, W } from '../constants';
import { getActiveBackgroundItem } from '../shop/data';
import { world } from '../state';

export function drawBg(ctx: CanvasRenderingContext2D): void {
  const theme = getActiveBackgroundItem(world.gameData);
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  theme.sky.forEach(([pos, color]) => sky.addColorStop(pos, color));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  if (theme.glowAccent) {
    const ga = theme.glowAccent;
    const gg = ctx.createRadialGradient(ga.x, ga.y, 0, ga.x, ga.y, ga.r);
    gg.addColorStop(0, ga.color);
    gg.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  const floorY = H - 50;
  world.decor.forEach(s => {
    s.phase += 0.04;
    ctx.save();
    switch (theme.decor.kind) {
      case 'fireflies': {
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(s.phase));
        ctx.shadowBlur = 8;
        ctx.shadowColor = theme.decor.color;
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (world.state === 'play') s.y += Math.sin(s.phase) * 0.3;
        if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
        break;
      }
      case 'bubbles': {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = theme.decor.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.stroke();
        if (world.state === 'play') { s.y -= s.speed; s.x += Math.sin(s.phase) * 0.3; }
        if (s.y < 0) { s.y = floorY; s.x = Math.random() * W; }
        break;
      }
      case 'sandhaze': {
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.r * 3, s.r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        if (world.state === 'play') s.x -= s.speed;
        if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
        break;
      }
      case 'snowflakes': {
        ctx.globalAlpha = 0.7 + 0.3 * Math.sin(s.phase);
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (world.state === 'play') { s.y += s.speed; s.x += Math.sin(s.phase) * 0.4; }
        if (s.y > floorY) { s.y = 0; s.x = Math.random() * W; }
        break;
      }
      case 'embers': {
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(s.phase));
        ctx.shadowBlur = 6;
        ctx.shadowColor = theme.decor.color;
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (world.state === 'play') { s.y -= s.speed; s.x += Math.sin(s.phase) * 0.2; }
        if (s.y < 0) { s.y = floorY; s.x = Math.random() * W; }
        break;
      }
      default: { // 'stars'
        ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(s.phase));
        ctx.fillStyle = theme.decor.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (world.state === 'play') s.x -= s.speed;
        if (s.x < 0) { s.x = W; s.y = Math.random() * H; }
      }
    }
    ctx.restore();
  });

  ctx.save();
  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    const y = floorY + t * 55;
    ctx.globalAlpha = 0.08 + t * 0.14;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.1;
  const vp = W / 2;
  if (world.state === 'play') world.gridOffset = (world.gridOffset + SPEED) % 40;
  for (let x = -world.gridOffset; x < W + 40; x += 40) {
    ctx.beginPath();
    ctx.moveTo(vp + (x - vp) * 0.05, floorY);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  ctx.restore();

  const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
  floorGrad.addColorStop(0, theme.floor.top);
  floorGrad.addColorStop(1, theme.floor.bottom);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, W, H - floorY);

  ctx.save();
  ctx.shadowBlur = 12;
  ctx.shadowColor = theme.horizon;
  ctx.strokeStyle = theme.horizon + 'cc';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, floorY);
  ctx.lineTo(W, floorY);
  ctx.stroke();
  ctx.restore();
}
