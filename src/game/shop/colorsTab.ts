import { SHOP_COLORS } from './data';
import type { ColorItem } from './types';
import { purchaseOrEquip } from './collectibleShop';
import { world } from '../state';
import { drawCoin } from '../render/particles';

interface ItemRect { item: ColorItem; x: number; y: number; w: number; h: number }

function getColorItemRects(px: number, py: number, pw: number): ItemRect[] {
  const cols = 2, itemW = 128, itemH = 68, gapX = 14, gapY = 10;
  const gridX = px + (pw - cols * itemW - (cols - 1) * gapX) / 2;
  const gridY = py + 112;
  return SHOP_COLORS.map((item, i) => ({
    item,
    x: gridX + (i % cols) * (itemW + gapX),
    y: gridY + Math.floor(i / cols) * (itemH + gapY),
    w: itemW,
    h: itemH,
  }));
}

export function drawColorsTab(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  getColorItemRects(px, py, pw).forEach(({ item: col, x: cx, y: cy, w: itemW, h: itemH }) => {
    const owned = world.gameData.unlockedColors.includes(col.id);
    const active = world.gameData.activeColor === col.id;

    const borderCol = active ? '#f9ca24' : owned ? '#00ffa0' : '#1e3a4a';
    ctx.save();
    ctx.fillStyle = active ? '#0d1a0d' : '#050d18';
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = active ? 2 : 1;
    ctx.shadowBlur = active ? 12 : owned ? 6 : 0;
    ctx.shadowColor = borderCol;
    ctx.beginPath();
    ctx.roundRect(cx, cy, itemW, itemH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(cx + 30, cy + itemH / 2);
    ctx.shadowBlur = 10;
    ctx.shadowColor = col.glow;
    ctx.fillStyle = col.body;
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = col.wing;
    ctx.beginPath();
    ctx.ellipse(-3, 5, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#00eeff';
    ctx.shadowColor = '#00f7ff';
    ctx.beginPath();
    ctx.arc(7, -4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#001a22';
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#cde';
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText(col.label, cx + 52, cy + 24);

    if (active) {
      ctx.save();
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f9ca24';
      ctx.fillStyle = '#f9ca24';
      ctx.font = 'bold 11px "Courier New"';
      ctx.fillText('▶ EQUIPPED', cx + 52, cy + 44);
      ctx.restore();
    } else if (owned) {
      ctx.fillStyle = '#00ffa0';
      ctx.font = '11px "Courier New"';
      ctx.fillText('TAP EQUIP', cx + 52, cy + 44);
    } else {
      drawCoin(ctx, cx + 57, cy + 40, 7, 1);
      const canAfford = world.gameData.totalCoins >= col.price;
      ctx.save();
      if (canAfford) { ctx.shadowBlur = 6; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = canAfford ? '#f9ca24' : '#445566';
      ctx.font = 'bold 12px "Courier New"';
      ctx.fillText(String(col.price), cx + 68, cy + 45);
      ctx.restore();
    }
  });
}

export function handleColorsShopClick(mx: number, my: number, px: number, py: number, pw: number): void {
  for (const { item, x: cx, y: cy, w: itemW, h: itemH } of getColorItemRects(px, py, pw)) {
    if (mx >= cx && mx <= cx + itemW && my >= cy && my <= cy + itemH) {
      purchaseOrEquip(item, world.gameData.unlockedColors, 'activeColor');
      return;
    }
  }
}
