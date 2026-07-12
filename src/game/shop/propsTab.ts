import { world } from '../state';
import { drawColorsTab, handleColorsShopClick } from './colorsTab';
import { PROPS_SUB_TABS } from './data';
import { drawGlassesTab, handleGlassesShopClick } from './glassesTab';
import { drawHatsTab, handleHatsShopClick } from './hatsTab';
import { drawMasksTab, handleMasksShopClick } from './masksTab';
import { drawShoesTab, handleShoesShopClick } from './shoesTab';
import type { PropsSubTabId } from './types';

const SUB_TAB_LAYOUT = { tabW: 60, tabH: 20, gap: 3 };

/** Grid content in each sub-drawer starts at py+112 (see propGridTab.ts) — passing py+8 here
 *  shifts that down to align flush under the sub-tab row drawn at py+100..+120. */
const SUB_CONTENT_Y_OFFSET = 8;

const SUB_DRAWERS: Record<PropsSubTabId, (ctx: CanvasRenderingContext2D, px: number, py: number, pw: number) => void> = {
  colors: drawColorsTab,
  hats: drawHatsTab,
  glasses: drawGlassesTab,
  masks: drawMasksTab,
  shoes: drawShoesTab,
};

const SUB_HANDLERS: Record<PropsSubTabId, (mx: number, my: number, px: number, py: number, pw: number) => void> = {
  colors: handleColorsShopClick,
  hats: handleHatsShopClick,
  glasses: handleGlassesShopClick,
  masks: handleMasksShopClick,
  shoes: handleShoesShopClick,
};

function subTabRects(px: number, py: number, pw: number) {
  const { tabW, tabH, gap } = SUB_TAB_LAYOUT;
  const totalW = tabW * PROPS_SUB_TABS.length + gap * (PROPS_SUB_TABS.length - 1);
  const startX = px + (pw - totalW) / 2;
  const tabY = py + 100;
  return PROPS_SUB_TABS.map((tab, i) => ({
    tab,
    x: startX + i * (tabW + gap),
    y: tabY,
    w: tabW,
    h: tabH,
  }));
}

function drawSubTabs(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  subTabRects(px, py, pw).forEach(({ tab, x: tx, y: ty, w: tabW, h: tabH }) => {
    const active = world.propsSubTab === tab.id;
    ctx.save();
    ctx.fillStyle = active ? 'rgba(249,202,36,0.15)' : 'rgba(1,8,24,0.6)';
    ctx.strokeStyle = active ? '#f9ca24' : '#1e3a4a';
    ctx.lineWidth = active ? 1.5 : 1;
    ctx.shadowBlur = active ? 8 : 0;
    ctx.shadowColor = '#f9ca24';
    ctx.beginPath();
    ctx.roundRect(tx, ty, tabW, tabH, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = active ? '#f9ca24' : '#5a7a8a';
    ctx.font = 'bold 9px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(tab.label, tx + tabW / 2, ty + 14);
    ctx.restore();
  });
}

export function drawPropsTab(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  drawSubTabs(ctx, px, py, pw);
  SUB_DRAWERS[world.propsSubTab](ctx, px, py + SUB_CONTENT_Y_OFFSET, pw);
}

export function handlePropsShopClick(mx: number, my: number, px: number, py: number, pw: number): void {
  for (const { tab, x: tx, y: ty, w: tabW, h: tabH } of subTabRects(px, py, pw)) {
    if (mx >= tx && mx <= tx + tabW && my >= ty && my <= ty + tabH) {
      world.propsSubTab = tab.id;
      return;
    }
  }
  SUB_HANDLERS[world.propsSubTab](mx, my, px, py + SUB_CONTENT_Y_OFFSET, pw);
}
