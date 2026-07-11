import { drawShoes } from '../render/props';
import { world } from '../state';
import { SHOP_SHOES } from './data';
import { drawMiniBirdPreview, drawPropGrid, handlePropGridClick } from './propGridTab';

export function drawShoesTab(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number): void {
  drawPropGrid(ctx, SHOP_SHOES, px, py, pw, world.gameData.unlockedShoes, world.gameData.activeShoe, (ctx, item) => {
    drawMiniBirdPreview(ctx);
    drawShoes(ctx, item, 13);
  });
}

export function handleShoesShopClick(mx: number, my: number, px: number, py: number, pw: number): void {
  handlePropGridClick(mx, my, px, py, pw, SHOP_SHOES, world.gameData.unlockedShoes, 'activeShoe');
}
