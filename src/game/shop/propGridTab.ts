import type { GameData } from '../persistence';
import { drawCoin } from '../render/particles';
import { skillState } from '../skills/state';
import { saveData, world } from '../state';

interface GridItem { id: string; label: string; price: number }
interface ItemRect<T> { item: T; x: number; y: number; w: number; h: number }

/**
 * Shared 2-column grid layout + toggle-equip click logic for the 4 wearable-prop sub-tabs
 * (hats/glasses/masks/shoes). Unlike colors/pipes/backgrounds (always exactly one active item,
 * via purchaseOrEquip), a prop category's "no item equipped" is a valid default state, so
 * clicking an already-equipped item unequips it back to '' instead of always staying active.
 */
export function getPropGridRects<T extends GridItem>(items: T[], px: number, py: number, pw: number): ItemRect<T>[] {
  const cols = 2, itemW = 128, itemH = 68, gapX = 14, gapY = 10;
  const gridX = px + (pw - cols * itemW - (cols - 1) * gapX) / 2;
  const gridY = py + 132;
  return items.map((item, i) => ({
    item,
    x: gridX + (i % cols) * (itemW + gapX),
    y: gridY + Math.floor(i / cols) * (itemH + gapY),
    w: itemW,
    h: itemH,
  }));
}

/** The small idle bird icon each prop-preview card draws itself over, matching colorsTab's mini bird. */
export function drawMiniBirdPreview(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#f9ca2488';
  ctx.fillStyle = '#f9ca24';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f0932b';
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
}

export function drawPropGrid<T extends GridItem>(
  ctx: CanvasRenderingContext2D,
  items: T[],
  px: number,
  py: number,
  pw: number,
  unlockedIds: string[],
  activeId: string,
  drawPreview: (ctx: CanvasRenderingContext2D, item: T, cx: number, cy: number, itemH: number) => void,
): void {
  getPropGridRects(items, px, py, pw).forEach(({ item, x: cx, y: cy, w: itemW, h: itemH }) => {
    const owned = unlockedIds.includes(item.id);
    const active = activeId === item.id;

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
    drawPreview(ctx, item, 0, 0, itemH);
    ctx.restore();

    ctx.fillStyle = '#cde';
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'left';
    ctx.fillText(item.label, cx + 52, cy + 24);

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
      const canAfford = world.gameData.totalCoins >= item.price;
      ctx.save();
      if (canAfford) { ctx.shadowBlur = 6; ctx.shadowColor = '#f9ca24'; }
      ctx.fillStyle = canAfford ? '#f9ca24' : '#445566';
      ctx.font = 'bold 12px "Courier New"';
      ctx.fillText(String(item.price), cx + 68, cy + 45);
      ctx.restore();
    }
  });
}

export function handlePropGridClick<T extends GridItem>(
  mx: number,
  my: number,
  px: number,
  py: number,
  pw: number,
  items: T[],
  unlockedList: string[],
  activeKey: keyof GameData,
): void {
  for (const { item, x: cx, y: cy, w: itemW, h: itemH } of getPropGridRects(items, px, py, pw)) {
    if (mx >= cx && mx <= cx + itemW && my >= cy && my <= cy + itemH) {
      const active = (world.gameData[activeKey] as string) === item.id;
      if (active) {
        (world.gameData[activeKey] as string) = '';
        saveData();
      } else if (unlockedList.includes(item.id)) {
        (world.gameData[activeKey] as string) = item.id;
        saveData();
      } else if (world.gameData.totalCoins >= item.price) {
        world.gameData.totalCoins -= item.price;
        unlockedList.push(item.id);
        (world.gameData[activeKey] as string) = item.id;
        saveData();
      } else {
        skillState.shopMessage = 'NOT ENOUGH COINS';
        skillState.shopMessageTimer = 90;
      }
      return;
    }
  }
}
