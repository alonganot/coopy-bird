import { renameUsername } from './api';
import { H, W } from './constants';
import { setStoredUsername } from './persistence';
import { neonPanel } from './render/panel';
import { world } from './state';
import type { SettingsInputAdapter } from './settingsInput';

let message = '';
let messageTimer = 0;

const GEAR_BUTTON = { x: W - 40, y: 50, w: 30, h: 30 };
const PANEL = { x: 40, y: H / 2 - 90, w: W - 80, h: 180 };

/** Fixed top-right icon button, independent of the idle-screen's title card layout. */
export function drawSettingsButton(ctx: CanvasRenderingContext2D): void {
  if (world.state !== 'idle' || world.shopState) return;
  ctx.save();
  ctx.fillStyle = 'rgba(1,8,24,0.75)';
  ctx.strokeStyle = '#00f7ff99';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 6;
  ctx.shadowColor = '#00f7ff';
  ctx.beginPath();
  ctx.roundRect(GEAR_BUTTON.x, GEAR_BUTTON.y, GEAR_BUTTON.w, GEAR_BUTTON.h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#00f7ff';
  ctx.font = 'bold 16px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('⚙', GEAR_BUTTON.x + GEAR_BUTTON.w / 2, GEAR_BUTTON.y + GEAR_BUTTON.h / 2 + 6);
  ctx.restore();
}

export function handleSettingsButtonClick(mx: number, my: number): boolean {
  if (world.state !== 'idle' || world.shopState) return false;
  const { x, y, w, h } = GEAR_BUTTON;
  if (mx < x || mx > x + w || my < y || my > y + h) return false;
  world.settingsState = 'settings';
  return true;
}

export function getUsernameInputRect() {
  return { x: PANEL.x + 20, y: PANEL.y + 66, w: PANEL.w - 40, h: 32 };
}

function getCloseButtonRect() {
  return { x: W / 2 - 44, y: PANEL.y + PANEL.h - 42, w: 88, h: 28 };
}

export function drawSettingsPanel(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,8,0.85)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  neonPanel(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 12, '#00f7ff');

  ctx.save();
  ctx.shadowBlur = 14;
  ctx.shadowColor = '#00f7ff';
  ctx.fillStyle = '#00f7ff';
  ctx.font = 'bold 18px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('// SETTINGS //', W / 2, PANEL.y + 32);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#7ecfff';
  ctx.font = '12px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('USERNAME (TAP TO CHANGE)', W / 2, PANEL.y + 56);
  ctx.restore();
  // The DOM input from settingsInput.ts sits directly on top of getUsernameInputRect() here.

  const close = getCloseButtonRect();
  ctx.save();
  ctx.strokeStyle = '#ff4466aa';
  ctx.fillStyle = 'rgba(40,0,10,0.9)';
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 8;
  ctx.shadowColor = '#ff446688';
  ctx.beginPath();
  ctx.roundRect(close.x, close.y, close.w, close.h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff4466';
  ctx.font = 'bold 13px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('[ CLOSE ]', close.x + close.w / 2, close.y + close.h / 2 + 5);
  ctx.restore();

  if (messageTimer > 0) {
    messageTimer--;
    ctx.save();
    ctx.globalAlpha = Math.min(1, messageTimer / 20);
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ff4466';
    ctx.fillStyle = '#ff4466';
    ctx.font = 'bold 11px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText(message, W / 2, PANEL.y + PANEL.h - 54);
    ctx.restore();
  }
}

export function handleSettingsPanelClick(mx: number, my: number): void {
  const close = getCloseButtonRect();
  if (mx >= close.x && mx <= close.x + close.w && my >= close.y && my <= close.y + close.h) {
    world.settingsState = null;
  }
}

export function createSettingsInputAdapter(): SettingsInputAdapter {
  return {
    getInitialValue: () => world.username,
    async onCommit(newUsername: string) {
      const result = await renameUsername(world.username, newUsername);
      if (result.ok) {
        world.username = newUsername;
        setStoredUsername(newUsername);
        message = '';
        messageTimer = 0;
        return { ok: true };
      }
      message = result.reason === 'taken' ? 'USERNAME ALREADY TAKEN' : 'INVALID USERNAME';
      messageTimer = 150;
      return { ok: false };
    },
  };
}
