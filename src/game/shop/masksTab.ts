import { drawMask } from '../render/props';
import { world } from '../state';
import { SHOP_MASKS } from './data';
import { drawMiniBirdPreview, drawPropGrid, handlePropGridClick } from './propGridTab';

export function drawMasksTab(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  drawPropGrid(ctx, SHOP_MASKS, px, py, pw, world.gameData.unlockedMasks, world.gameData.activeMask, (ctx, item) => {
    drawMiniBirdPreview(ctx);
    drawMask(ctx, item, 16);
  });
}

export function handleMasksShopClick(mx: number, my: number, px: number, py: number, pw: number): void {
  handlePropGridClick(mx, my, px, py, pw, SHOP_MASKS, world.gameData.unlockedMasks, 'activeMask');
}
