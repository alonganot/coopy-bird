import { H, W } from '../game/constants';
import type { Connection } from './connection';
import { mpState, you } from './mpState';
import { getReadyButtonRect } from './render/lobby';

const SKILL_SLOT_KEYS: Record<string, number> = { Digit1: 0, Digit2: 1, Digit3: 2 };

function toCanvasCoords(canvas: HTMLCanvasElement, clientX: number, clientY: number): [number, number] {
  const rect = canvas.getBoundingClientRect();
  return [(clientX - rect.left) * (W / rect.width), (clientY - rect.top) * (H / rect.height)];
}

function handleClick(mx: number, my: number, conn: Connection): void {
  if (mpState.phase === 'waiting' || mpState.phase === 'ready-check') {
    const r = getReadyButtonRect();
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
      conn.send({ type: 'ready', ready: !(you()?.ready ?? false) });
    }
    return;
  }
  if (mpState.phase === 'playing') conn.send({ type: 'jump' });
}

export function pressSkillSlot(conn: Connection, slot: number): void {
  const id = you()?.equippedOrder[slot];
  if (!id) return;
  if (id === 'hover') conn.send({ type: 'skillHoverStart', slot }); else conn.send({ type: 'skillActivate', slot });
}

export function releaseSkillSlot(conn: Connection, slot: number): void {
  const id = you()?.equippedOrder[slot];
  if (id === 'hover') conn.send({ type: 'skillHoverStop', slot });
}

export function attachMultiplayerInput(canvas: HTMLCanvasElement, conn: Connection): () => void {
  const onKeyDown = (e: KeyboardEvent) => {
    if (mpState.phase === 'playing' && e.code === 'Space') conn.send({ type: 'jump' });
    const slot = SKILL_SLOT_KEYS[e.code];
    if (slot === undefined) return;
    pressSkillSlot(conn, slot);
  };

  const onKeyUp = (e: KeyboardEvent) => {
    const slot = SKILL_SLOT_KEYS[e.code];
    if (slot === undefined) return;
    releaseSkillSlot(conn, slot);
  };

  const onClick = (e: MouseEvent) => {
    const [mx, my] = toCanvasCoords(canvas, e.clientX, e.clientY);
    handleClick(mx, my, conn);
  };

  const onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    const [mx, my] = toCanvasCoords(canvas, t.clientX, t.clientY);
    handleClick(mx, my, conn);
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
