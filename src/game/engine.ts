import { H, W } from './constants';
import { attachInput } from './input';
import { attachSkillButtons } from './mobileControls';
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

export function createGame(canvas: HTMLCanvasElement, controlsContainer?: HTMLElement | null) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  let rafId: number | null = null;
  let detachInput: (() => void) | null = null;
  let skillButtons: ReturnType<typeof attachSkillButtons> | null = null;

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
    skillButtons?.sync();

    rafId = requestAnimationFrame(loop);
  }

  return {
    start(): void {
      init();
      detachInput = attachInput(canvas);
      if (controlsContainer) skillButtons = attachSkillButtons(controlsContainer);
      rafId = requestAnimationFrame(loop);
    },
    stop(): void {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      detachInput?.();
      detachInput = null;
      skillButtons?.detach();
      skillButtons = null;
    },
  };
}
