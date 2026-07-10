import { attachInput } from './input';
import { drawBird } from './render/bird';
import { drawBg } from './render/background';
import { drawHUD } from './render/hud';
import { drawOverlay, drawScanlines } from './render/overlay';
import { drawParticles, drawProjectiles } from './render/particles';
import { drawPipe } from './render/pipe';
import { drawShop } from './shop/shop';
import { drawClone } from './skills/skills';
import { init, world } from './state';
import { update } from './update';

export function createGame(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!;
  let rafId: number | null = null;
  let detachInput: (() => void) | null = null;

  function loop() {
    world.tick++;
    if (world.state === 'idle' && !world.shopState) {
      if (--world.glitchTimer <= 0) {
        world.glitchActive = !world.glitchActive;
        world.glitchTimer = world.glitchActive ? 7 : Math.floor(Math.random() * 180 + 100);
      }
    } else {
      world.glitchActive = false;
    }

    drawBg(ctx);
    world.pipes.forEach(p => drawPipe(ctx, p));
    drawBird(ctx);
    drawClone(ctx);
    drawProjectiles(ctx, world.projectiles);
    drawParticles(ctx, world.particles);
    drawHUD(ctx);
    drawOverlay(ctx);
    if (world.shopState === 'shop') drawShop(ctx);
    drawScanlines(ctx);
    update();

    rafId = requestAnimationFrame(loop);
  }

  return {
    start(): void {
      init();
      detachInput = attachInput(canvas);
      rafId = requestAnimationFrame(loop);
    },
    stop(): void {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      detachInput?.();
      detachInput = null;
    },
  };
}
