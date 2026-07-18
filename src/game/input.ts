import { H, JUMP, W } from './constants';
import { handleSettingsButtonClick, handleSettingsPanelClick } from './settingsPanel';
import { handleShopClick } from './shop/shop';
import type { SkillId } from './skills/data';
import { activateSkill, mirrorCloneJump, startHover, stopHover } from './skills/skills';
import { init, world } from './state';

const SKILL_SLOT_KEYS: Record<string, number> = { Digit1: 0, Digit2: 1, Digit3: 2 };

export function jump(): void {
  if (world.state === 'dead') { init(); return; }
  if (world.state === 'idle') world.state = 'play';
  world.bird.vy = JUMP;
  world.bird.thrustAnim = 1;
  mirrorCloneJump();
}

export function handleCanvasClick(mx: number, my: number): void {
  if (world.shopState === 'shop') { handleShopClick(mx, my); return; }
  if (world.settingsState === 'settings') { handleSettingsPanelClick(mx, my); return; }
  if (world.state === 'idle' && mx >= W / 2 - 50 && mx <= W / 2 + 50 && my >= H / 2 + 38 && my <= H / 2 + 68) {
    world.shopState = 'shop';
    return;
  }
  if (world.state === 'idle' && handleSettingsButtonClick(mx, my)) return;
  jump();
}

/** Shared by the keyboard slot handler and the on-screen mobile skill buttons. */
export function pressSkillSlot(slot: number): void {
  const id = world.gameData.equippedOrder[slot] as SkillId | undefined;
  if (!id) return;
  if (id === 'hover') startHover(); else activateSkill(id);
}

/** Shared by the keyboard slot handler and the on-screen mobile skill buttons. */
export function releaseSkillSlot(slot: number): void {
  const id = world.gameData.equippedOrder[slot] as SkillId | undefined;
  if (id === 'hover') stopHover();
}

export function attachInput(canvas: HTMLCanvasElement): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    if (world.shopState || world.settingsState) return;
    if (e.code === 'Space') jump();
    const slot = SKILL_SLOT_KEYS[e.code];
    if (slot === undefined) return;
    pressSkillSlot(slot);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const slot = SKILL_SLOT_KEYS[e.code];
    if (slot === undefined) return;
    releaseSkillSlot(slot);
  };

  // Maps a client (CSS-pixel) coordinate to the game's logical W×H coordinate
  // space (the same space all drawing/hit-testing uses) — necessary because the
  // canvas is CSS-scaled to fit the viewport, so its displayed CSS size rarely
  // matches the logical W×H 1:1. Deliberately scales against W/H, not
  // canvas.width/height, since the backing store may additionally be
  // devicePixelRatio-scaled (see engine.ts) and drawing is done through a
  // ctx.scale(dpr, dpr) context that already undoes that for us.
  function toCanvasCoords(clientX: number, clientY: number): [number, number] {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    return [(clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY];
  }

  const onClick = (e: MouseEvent) => {
    const [mx, my] = toCanvasCoords(e.clientX, e.clientY);
    handleCanvasClick(mx, my);
  };

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    const [mx, my] = toCanvasCoords(t.clientX, t.clientY);
    handleCanvasClick(mx, my);
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });

  return () => {
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('touchstart', onTouchStart);
  };
}
