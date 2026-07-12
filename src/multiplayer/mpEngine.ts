import { H, W } from '../game/constants';
import { attachSkillButtons } from '../game/mobileControls';
import { attachModeSwitch } from '../game/modeSwitchButton';
import { drawBg } from '../game/render/background';
import { drawScanlines } from '../game/render/overlay';
import { drawPipe } from '../game/render/pipe';
import { getActiveColorItem, getActiveGlassesItem, getActiveHatItem, getActiveMaskItem, getActiveShoeItem } from '../game/shop/data';
import { saveData, world } from '../game/state';
import { connect, type Connection } from './connection';
import { attachNameInput } from './nameInput';
import { applyServerMessage, mpState, resetMpState, you } from './mpState';
import { attachMultiplayerInput, pressSkillSlot, releaseSkillSlot } from './mpInput';
import { drawLobby, getReadyButtonRect } from './render/lobby';
import { drawMpHud } from './render/mpHud';
import { drawMpOverlay } from './render/mpOverlay';
import { drawRemotePlayer } from './render/remoteBird';

export interface CreateMultiplayerGameOptions {
  onSwitchMode?: () => void;
}

export function createMultiplayerGame(
  canvas: HTMLCanvasElement,
  controlsContainer?: HTMLElement | null,
  options?: CreateMultiplayerGameOptions,
) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);

  let rafId: number | null = null;
  let detachInput: (() => void) | null = null;
  let conn: Connection | null = null;
  let skillButtons: ReturnType<typeof attachSkillButtons> | null = null;
  let modeSwitch: ReturnType<typeof attachModeSwitch> | null = null;
  let nameInput: ReturnType<typeof attachNameInput> | null = null;

  function loop() {
    mpState.tick++;
    drawBg(ctx);
    mpState.pipes.forEach(p => drawPipe(ctx, p));
    mpState.players.forEach(p => drawRemotePlayer(ctx, p, mpState.tick, p.id === mpState.you));
    drawMpHud(ctx);
    if (mpState.phase === 'waiting' || mpState.phase === 'ready-check' || mpState.phase === 'countdown') drawLobby(ctx);
    if (mpState.phase === 'ended') drawMpOverlay(ctx);
    drawScanlines(ctx);
    skillButtons?.sync();
    modeSwitch?.sync();
    nameInput?.sync();
    rafId = requestAnimationFrame(loop);
  }

  function join(): void {
    const gameData = world.gameData;
    if (!gameData.displayName) {
      gameData.displayName = `Player${Math.floor(Math.random() * 9000 + 1000)}`;
      saveData();
    }
    const col = getActiveColorItem(gameData);
    conn!.send({
      type: 'join',
      name: gameData.displayName,
      color: { body: col.body, wing: col.wing, glow: col.glow },
      props: {
        hat: getActiveHatItem(gameData)?.id ?? '',
        glasses: getActiveGlassesItem(gameData)?.id ?? '',
        mask: getActiveMaskItem(gameData)?.id ?? '',
        shoe: getActiveShoeItem(gameData)?.id ?? '',
      },
      equippedOrder: gameData.equippedOrder,
    });
  }

  return {
    start(): void {
      resetMpState();
      conn = connect(applyServerMessage);
      join();

      detachInput = attachMultiplayerInput(canvas, conn);
      if (controlsContainer) {
        skillButtons = attachSkillButtons(controlsContainer, {
          press: slot => pressSkillSlot(conn!, slot),
          release: slot => releaseSkillSlot(conn!, slot),
          getSlot(slot) {
            const me = you();
            if (!me || mpState.phase !== 'playing') return null;
            const id = me.equippedOrder[slot];
            if (!id) return null;
            const active = (me.activeTimer[id] ?? 0) > 0;
            const charges = me.charges[id] ?? 0;
            return { label: id, color: '#00f7ff', empty: !active && charges <= 0 };
          },
        });
        if (options?.onSwitchMode) {
          modeSwitch = attachModeSwitch(controlsContainer, {
            label: 'SINGLE PLAYER',
            onToggle: options.onSwitchMode,
            getPlacement() {
              // Directly under the lobby's READY button, same size.
              if (mpState.phase !== 'waiting' && mpState.phase !== 'ready-check') return null;
              const r = getReadyButtonRect();
              return { x: r.x, y: r.y + r.h + 10, w: r.w, h: r.h };
            },
          });
        }
        nameInput = attachNameInput(controlsContainer, {
          getInitialValue: () => world.gameData.displayName,
          onCommit(name) {
            world.gameData.displayName = name;
            saveData();
            conn?.send({ type: 'rename', name });
          },
        });
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
      nameInput?.detach();
      nameInput = null;
      conn?.close();
      conn = null;
    },
  };
}
