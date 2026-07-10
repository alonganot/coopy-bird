import { H, W } from '../game/constants';
import { mpState } from './mpState';
import { getNameInputRect } from './render/lobby';

export interface NameInputAdapter {
  getInitialValue(): string;
  onCommit(name: string): void;
}

/** A persistent (always-editable) name field shown while the multiplayer lobby is visible. */
export function attachNameInput(container: HTMLElement, adapter: NameInputAdapter): { sync(): void; detach(): void } {
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = 16;
  input.className = 'lobby-name-input';
  input.placeholder = 'YOUR NAME';
  input.value = adapter.getInitialValue();
  input.hidden = true;

  let committed = input.value;
  function commit(): void {
    const name = input.value.trim();
    if (name && name !== committed) {
      committed = name;
      adapter.onCommit(name);
    } else {
      input.value = committed; // revert to the last valid name if cleared
    }
  }

  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') input.blur();
  });

  container.appendChild(input);

  return {
    sync(): void {
      const visible = mpState.phase === 'waiting' || mpState.phase === 'ready-check';
      input.hidden = !visible;
      if (!visible) return;
      const r = getNameInputRect();
      input.style.left = `${(r.x / W) * 100}%`;
      input.style.top = `${(r.y / H) * 100}%`;
      input.style.width = `${(r.w / W) * 100}%`;
      input.style.height = `${(r.h / H) * 100}%`;
    },
    detach(): void {
      input.removeEventListener('blur', commit);
      input.remove();
    },
  };
}
