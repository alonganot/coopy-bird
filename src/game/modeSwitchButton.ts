import { H, W } from './constants';

export interface ModeSwitchPlacement {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ModeSwitchAdapter {
  label: string;
  onToggle(): void;
  /** Returns null to hide the button (e.g. mid-match, or while another overlay owns the screen). */
  getPlacement(): ModeSwitchPlacement | null;
}

export function attachModeSwitch(container: HTMLElement, adapter: ModeSwitchAdapter): { sync(): void; detach(): void } {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'mode-switch';
  button.hidden = true;
  button.textContent = adapter.label;

  const onClick = () => adapter.onToggle();
  button.addEventListener('click', onClick);
  container.appendChild(button);

  return {
    sync(): void {
      const placement = adapter.getPlacement();
      if (!placement) {
        button.hidden = true;
        return;
      }
      button.hidden = false;
      button.style.left = `${(placement.x / W) * 100}%`;
      button.style.top = `${(placement.y / H) * 100}%`;
      button.style.width = `${(placement.w / W) * 100}%`;
      button.style.height = `${(placement.h / H) * 100}%`;
    },
    detach(): void {
      button.removeEventListener('click', onClick);
      button.remove();
    },
  };
}
