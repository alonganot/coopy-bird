import { drawCoin } from '../render/particles';
import { neonPanel } from '../render/panel';
import { drawSkillsTab, handleSkillsShopClick } from '../skills/skillsTab';
import { skillState } from '../skills/state';
import { world } from '../state';
import type { ShopTabId } from '../types';
import { H, W } from '../constants';
import { drawBackgroundsTab, handleBackgroundsShopClick } from './backgroundsTab';
import { drawColorsTab, handleColorsShopClick } from './colorsTab';
import { SHOP_TABS } from './data';
import { drawPipesTab, handlePipesShopClick } from './pipesTab';

const SHOP_TAB_LAYOUT = { tabW: 80, tabH: 24, gap: 4 };

const TAB_DRAWERS: Record<ShopTabId, (ctx: CanvasRenderingContext2D, px: number, py: number, pw: number) => void> = {
  colors: drawColorsTab,
  skills: drawSkillsTab,
  pipes: drawPipesTab,
  bg: drawBackgroundsTab,
};

const TAB_HANDLERS: Record<ShopTabId, (mx: number, my: number, px: number, py: number, pw: number) => void> = {
  colors: handleColorsShopClick,
  skills: handleSkillsShopClick,
  pipes: handlePipesShopClick,
  bg: handleBackgroundsShopClick,
};

export function drawShopButton(ctx: CanvasRenderingContext2D): void {
  const pulse = 0.5 + 0.5 * Math.sin(world.tick * 0.07);
  ctx.save();
  ctx.shadowBlur = 8 + pulse * 12;
  ctx.shadowColor = '#f9ca24';
  ctx.strokeStyle = `rgba(249,202,36,${0.45 + pulse * 0.35})`;
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(1,8,24,0.85)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 52, H / 2 + 38, 104, 30, 6);
  ctx.fill();
  ctx.stroke();
  drawCoin(ctx, W / 2 - 24, H / 2 + 53, 7, 1);
  ctx.fillStyle = '#f9ca24';
  ctx.shadowBlur = 6;
  ctx.font = 'bold 13px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('SHOP', W / 2 + 12, H / 2 + 58);
  ctx.restore();
}

function drawShopTabs(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  const { tabW, tabH, gap } = SHOP_TAB_LAYOUT;
  const totalW = tabW * SHOP_TABS.length + gap * (SHOP_TABS.length - 1);
  const startX = px + (pw - totalW) / 2;
  const tabY = py + 72;
  SHOP_TABS.forEach((tab, i) => {
    const tx = startX + i * (tabW + gap);
    const active = world.shopTab === tab.id;
    ctx.save();
    ctx.fillStyle = active ? 'rgba(0,247,255,0.15)' : 'rgba(1,8,24,0.6)';
    ctx.strokeStyle = active ? '#00f7ff' : '#1e3a4a';
    ctx.lineWidth = active ? 1.5 : 1;
    ctx.shadowBlur = active ? 10 : 0;
    ctx.shadowColor = '#00f7ff';
    ctx.beginPath();
    ctx.roundRect(tx, tabY, tabW, tabH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = active ? '#00f7ff' : '#5a7a8a';
    ctx.font = 'bold 12px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(tab.label, tx + tabW / 2, tabY + 17);
    ctx.restore();
  });
}

function drawCloseButton(ctx: CanvasRenderingContext2D, py: number, ph: number): void {
  ctx.save();
  ctx.strokeStyle = '#ff4466aa';
  ctx.lineWidth = 1.5;
  ctx.fillStyle = 'rgba(40,0,10,0.9)';
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#ff446688';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 44, py + ph - 42, 88, 28, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff4466';
  ctx.shadowBlur = 6;
  ctx.font = 'bold 13px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('[ CLOSE ]', W / 2, py + ph - 23);
  ctx.restore();
}

function renderShopMessage(ctx: CanvasRenderingContext2D, py: number, ph: number): void {
  if (skillState.shopMessageTimer > 0) {
    skillState.shopMessageTimer--;
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff4466';
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 11px "Courier New"';
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, skillState.shopMessageTimer / 20);
    ctx.fillText(skillState.shopMessage, W / 2, py + ph - 52);
    ctx.restore();
  }
}

export function drawShop(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(0,0,8,0.88)';
  ctx.fillRect(0, 0, W, H);

  const px = 24, py = 50, pw = W - 48, ph = H - 100;
  neonPanel(ctx, px, py, pw, ph, 14, '#00f7ff');

  ctx.save();
  ctx.shadowBlur = 14;
  ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00f7ff';
  ctx.font = 'bold 22px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('// SHOP //', W / 2, py + 34);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#00f7ff33';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 16, py + 46);
  ctx.lineTo(px + pw - 16, py + 46);
  ctx.stroke();
  ctx.restore();

  drawCoin(ctx, px + 20, py + 62, 9, 1);
  ctx.save();
  ctx.fillStyle = '#f9ca24';
  ctx.font = '13px "Courier New"';
  ctx.textAlign = 'left';
  ctx.fillText(world.gameData.totalCoins + ' coins', px + 32, py + 67);
  ctx.restore();

  drawShopTabs(ctx, px, py, pw);
  TAB_DRAWERS[world.shopTab](ctx, px, py, pw);
  renderShopMessage(ctx, py, ph);
  drawCloseButton(ctx, py, ph);
}

export function handleShopClick(mx: number, my: number): void {
  const px = 24, py = 50, pw = W - 48, ph = H - 100;
  if (mx >= W / 2 - 44 && mx <= W / 2 + 44 && my >= py + ph - 42 && my <= py + ph - 14) {
    world.shopState = null;
    return;
  }

  const { tabW, tabH, gap } = SHOP_TAB_LAYOUT;
  const totalW = tabW * SHOP_TABS.length + gap * (SHOP_TABS.length - 1);
  const startX = px + (pw - totalW) / 2;
  const tabY = py + 72;
  if (my >= tabY && my <= tabY + tabH) {
    for (let i = 0; i < SHOP_TABS.length; i++) {
      const tx = startX + i * (tabW + gap);
      if (mx >= tx && mx <= tx + tabW) { world.shopTab = SHOP_TABS[i].id; return; }
    }
  }

  TAB_HANDLERS[world.shopTab](mx, my, px, py, pw);
}
