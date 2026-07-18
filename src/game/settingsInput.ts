import { H, W } from './constants';

export interface SettingsInputAdapter {
  getInitialValue(): string;
  onCommit(newUsername: string): Promise<{ ok: boolean }>;
}

interface Rect { x: number; y: number; w: number; h: number }

/**
 * A DOM text input overlay for the settings panel's username field, adapted from the
 * old multiplayer lobby name input (nameInput.ts) but async-aware: renaming is a
 * server round-trip that can be rejected (username taken), so committing disables the
 * input until the result comes back, then either keeps the new value or reverts.
 */
export function attachSettingsInput(
  container: HTMLElement,
  adapter: SettingsInputAdapter,
  getRect: () => Rect | null,
): { sync(): void; detach(): void } {
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 16;
  input.className = 'settings-username-input';
  input.value = adapter.getInitialValue();
  input.hidden = true;

  let committed = input.value;
  let pending = false;

  async function commit(): Promise<void> {
    const value = input.value.trim();
    if (!value || value === committed || pending) {
      input.value = committed;
      return;
    }
    pending = true;
    input.disabled = true;
    const result = await adapter.onCommit(value);
    pending = false;
    input.disabled = false;
    if (result.ok) committed = value;
    else input.value = committed;
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
  });

  container.appendChild(input);

  return {
    sync(): void {
      const rect = getRect();
      input.hidden = !rect;
      if (!rect) return;
      input.style.left = `${(rect.x / W) * 100}%`;
      input.style.top = `${(rect.y / H) * 100}%`;
      input.style.width = `${(rect.w / W) * 100}%`;
      input.style.height = `${(rect.h / H) * 100}%`;
      // Reflect an externally-changed username (e.g. panel just reopened) while not focused.
      if (document.activeElement !== input) {
        const latest = adapter.getInitialValue();
        if (latest !== committed) {
          committed = latest;
          input.value = latest;
        }
      }
    },
    detach(): void {
      input.removeEventListener('blur', commit);
      input.remove();
    },
  };
}
