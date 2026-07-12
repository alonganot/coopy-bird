import { drawHat } from '../render/props';
import { world } from '../state';
import { SHOP_HATS } from './data';
import { drawMiniBirdPreview, drawPropGrid, handlePropGridClick } from './propGridTab';

export function drawHatsTab(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  drawPropGrid(ctx, SHOP_HATS, px, py, pw, world.gameData.unlockedHats, world.gameData.activeHat, (ctx, item) => {
    drawMiniBirdPreview(ctx);
    drawHat(ctx, item, 16);
  });
}

export function handleHatsShopClick(mx: number, my: number, px: number, py: number, pw: number): void {
  handlePropGridClick(mx, my, px, py, pw, SHOP_HATS, world.gameData.unlockedHats, 'activeHat');
}
