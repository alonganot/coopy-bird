import { H, JUMP, W } from './constants';
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
  if (world.state === 'idle' && mx >= W / 2 - 50 && mx <= W / 2 + 50 && my >= H / 2 + 38 && my <= H / 2 + 68) {
    world.shopState = 'shop';
    return;
  }
  jump();
}

export function attachInput(canvas: HTMLCanvasElement): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    if (world.shopState) return;
    if (e.code === 'Space') jump();
    const slot = SKILL_SLOT_KEYS[e.code];
    if (slot === undefined) return;
    const id = world.gameData.equippedOrder[slot] as SkillId | undefined;
    if (!id) return;
    if (id === 'hover') startHover(); else activateSkill(id);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const slot = SKILL_SLOT_KEYS[e.code];
    if (slot === undefined) return;
    const id = world.gameData.equippedOrder[slot] as SkillId | undefined;
    if (id === 'hover') stopHover();
  };

  const onClick = (e: MouseEvent) => {
    const r = canvas.getBoundingClientRect();
    handleCanvasClick(e.clientX - r.left, e.clientY - r.top);
  };

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    handleCanvasClick(t.clientX - r.left, t.clientY - r.top);
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
