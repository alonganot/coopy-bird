import { drawCoin } from '../render/particles';
import { makeDecor, world } from '../state';
import { purchaseOrEquip } from './collectibleShop';
import { SHOP_BACKGROUNDS } from './data';
import type { BackgroundItem } from './types';

interface ItemRect { item: BackgroundItem; x: number; y: number; w: number; h: number }

function getBackgroundItemRects(px: number, py: number, pw: number): ItemRect[] {
  const itemW = pw - 32, itemH = 40, gapY = 6;
  const gridX = px + 16;
  const gridY = py + 112;
  return SHOP_BACKGROUNDS.map((item, i) => ({
    item, x: gridX, y: gridY + i * (itemH + gapY), w: itemW, h: itemH,
  }));
}

function drawBackgroundSwatch(
  ctx: CanvasRenderingContext2D,
  item: BackgroundItem,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.save();
  const g = ctx.createLinearGradient(x, y, x, y + h);
  item.sky.forEach(([pos, color]) => g.addColorStop(pos, color));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = item.floor.bottom;
  ctx.fillRect(x, y + h - h * 0.22, w, h * 0.22);
  ctx.strokeStyle = item.horizon + '99';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 4);
  ctx.stroke();
  ctx.restore();
}

export function drawBackgroundsTab(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  getBackgroundItemRects(px, py, pw).forEach(({ item, x: cx, y: cy, w: itemW, h: itemH }) => {
    const owned = world.gameData.unlockedBackgrounds.includes(item.id);
    const active = world.gameData.activeBackground === item.id;
    const borderCol = active ? '#f9ca24' : owned ? '#00ffa0' : '#1e3a4a';

    ctx.save();
    ctx.fillStyle = active ? '#0d1a0d' : '#050d18';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = active ? 2 : 1;
    ctx.shadowBlur = active ? 10 : owned ? 5 : 0;
    ctx.shadowColor = borderCol;
    ctx.beginPath();
    ctx.roundRect(cx, cy, itemW, itemH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    drawBackgroundSwatch(ctx, item, cx + 8, cy + 6, 40, itemH - 12);

    ctx.fillStyle = '#cde';
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, cx + 58, cy + 24);

    if (active) {
      ctx.save();
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = '#f9ca24';
      ctx.font = 'bold 10px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText('▶ EQUIPPED', cx + itemW - 10, cy + 24);
      ctx.restore();
    } else if (owned) {
      ctx.fillStyle = '#00ffa0';
      ctx.font = '10px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText('TAP EQUIP', cx + itemW - 10, cy + 24);
    } else {
      const canAfford = world.gameData.totalCoins >= item.price;
      drawCoin(ctx, cx + itemW - 42, cy + 20, 6, 1);
      ctx.save();
      if (canAfford) { ctx.shadowBlur = 5; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = canAfford ? '#f9ca24' : '#445566';
      ctx.font = 'bold 11px "Courier New"';
      ctx.textAlign = 'right';
      ctx.fillText(String(item.price), cx + itemW - 10, cy + 24);
      ctx.restore();
    }
    ctx.textAlign = 'left';
  });
}

export function handleBackgroundsShopClick(mx: number, my: number, px: number, py: number, pw: number): void {
  for (const { item, x: cx, y: cy, w: itemW, h: itemH } of getBackgroundItemRects(px, py, pw)) {
    if (mx >= cx && mx <= cx + itemW && my >= cy && my <= cy + itemH) {
      if (purchaseOrEquip(item, world.gameData.unlockedBackgrounds, 'activeBackground')) makeDecor();
      return;
    }
  }
}
