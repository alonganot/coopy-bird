import { H, W } from './constants';
import { attachInput, pressSkillSlot, releaseSkillSlot } from './input';
import { attachSkillButtons } from './mobileControls';
import { attachModeSwitch } from './modeSwitchButton';
import { drawBird } from './render/bird';
import { drawBg } from './render/background';
import { drawHUD } from './render/hud';
import { drawOverlay, drawScanlines } from './render/overlay';
import { drawParticles, drawProjectiles } from './render/particles';
import { drawPipe } from './render/pipe';
import { attachSettingsInput } from './settingsInput';
import { createSettingsInputAdapter, drawSettingsButton, drawSettingsPanel, getUsernameInputRect } from './settingsPanel';
import { getActiveColorItem, getActiveGlassesItem, getActiveHatItem, getActiveMaskItem, getActiveShoeItem } from './shop/data';
import { drawShop } from './shop/shop';
import { SHOP_SKILLS } from './skills/data';
import { drawClone, isSkillActive, isSkillVisuallyActive } from './skills/skills';
import { skillState } from './skills/state';
import { init, world } from './state';
import { update } from './update';

export interface CreateGameOptions {
  onSwitchMode?: () => void;
}

export function createGame(canvas: HTMLCanvasElement, controlsContainer?: HTMLElement | null, options?: CreateGameOptions) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  let rafId: number | null = null;
  let detachInput: (() => void) | null = null;
  let skillButtons: ReturnType<typeof attachSkillButtons> | null = null;
  let modeSwitch: ReturnType<typeof attachModeSwitch> | null = null;
  let settingsInput: ReturnType<typeof attachSettingsInput> | null = null;

  function loop() {
    world.tick++;
    if (world.state === 'idle' && !world.shopState && !world.settingsState) {
      if (--world.glitchTimer <= 0) {
        world.glitchActive = !world.glitchActive;
        world.glitchTimer = world.glitchActive ? 7 : Math.floor(Math.random() * 180 + 100);
      }
    } else {
      world.glitchActive = false;
    }

    drawBg(ctx);
    world.pipes.forEach(p => drawPipe(ctx, p));
    const bird = world.bird;
    const col = getActiveColorItem(world.gameData);
    drawBird(ctx, {
      x: bird.x,
      y: bird.y,
      vy: bird.vy,
      r: bird.r,
      thrustAnim: bird.thrustAnim,
      color: col,
      idleBob: world.state === 'idle' ? Math.sin(world.tick * 0.05) * 6 : 0,
      effects: {
        shrink: isSkillActive('shrink'),
        invisible: isSkillActive('invisibility'),
        dash: isSkillActive('dash')
          ? { progress: skillState.activeTimer.dash / SHOP_SKILLS.find(s => s.id === 'dash')!.duration }
          : null,
      },
      props: {
        hat: getActiveHatItem(world.gameData),
        glasses: getActiveGlassesItem(world.gameData),
        mask: getActiveMaskItem(world.gameData),
        shoe: getActiveShoeItem(world.gameData),
      },
    });
    if (bird.thrustAnim > 0) bird.thrustAnim = Math.max(0, bird.thrustAnim - 0.08);
    drawClone(ctx);
    drawProjectiles(ctx, world.projectiles);
    drawParticles(ctx, world.particles);
    drawHUD(ctx);
    drawOverlay(ctx);
    if (world.state === 'idle' && !world.shopState) drawSettingsButton(ctx);
    if (world.shopState === 'shop') drawShop(ctx);
    if (world.settingsState === 'settings') drawSettingsPanel(ctx);
    drawScanlines(ctx);
    update();
    skillButtons?.sync();
    modeSwitch?.sync();
    settingsInput?.sync();

    rafId = requestAnimationFrame(loop);
  }

  return {
    start(): void {
      init();
      detachInput = attachInput(canvas);
      if (controlsContainer) {
        skillButtons = attachSkillButtons(controlsContainer, {
          press: pressSkillSlot,
          release: releaseSkillSlot,
          getSlot(slot) {
            if (world.state !== 'play') return null;
            const id = world.gameData.equippedOrder[slot];
            if (!id) return null;
            const skill = SHOP_SKILLS.find(s => s.id === id)!;
            const active = isSkillVisuallyActive(id);
            const charges = skillState.charges[id];
            return { label: skill.label, color: skill.color, empty: !active && charges <= 0 };
          },
        });
        if (options?.onSwitchMode) {
          modeSwitch = attachModeSwitch(controlsContainer, {
            label: 'MULTIPLAYER',
            onToggle: options.onSwitchMode,
            getPlacement() {
              // Directly under the idle screen's shop button, same size, as another row of that card.
              if (world.state !== 'idle' || world.shopState || world.settingsState) return null;
              return { x: W / 2 - 52, y: H / 2 + 76, w: 104, h: 30 };
            },
          });
        }
        settingsInput = attachSettingsInput(
          controlsContainer,
          createSettingsInputAdapter(),
          () => (world.settingsState === 'settings' ? getUsernameInputRect() : null),
        );
      }
      rafId = requestAnimationFrame(loop);
    },
    stop(): void {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      detachInput?.();
      detachInput = null;
      skillButtons?.detach();
      skillButtons = null;
      modeSwitch?.detach();
      modeSwitch = null;
      settingsInput?.detach();
      settingsInput = null;
    },
  };
}
