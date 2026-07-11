import { drawGlasses } from '../render/props';
import { world } from '../state';
import { SHOP_GLASSES } from './data';
import { drawMiniBirdPreview, drawPropGrid, handlePropGridClick } from './propGridTab';

export function drawGlassesTab(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  drawPropGrid(ctx, SHOP_GLASSES, px, py, pw, world.gameData.unlockedGlasses, world.gameData.activeGlasses, (ctx, item) => {
    drawMiniBirdPreview(ctx);
    drawGlasses(ctx, item, 16);
  });
}

export function handleGlassesShopClick(mx: number, my: number, px: number, py: number, pw: number): void {
  handlePropGridClick(mx, my, px, py, pw, SHOP_GLASSES, world.gameData.unlockedGlasses, 'activeGlasses');
}
