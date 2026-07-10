const SLOT_COUNT = 3;

export interface SkillButtonSlot {
  label: string;
  color: string;
  empty: boolean;
}

export interface SkillButtonsAdapter {
  press(slot: number): void;
  release(slot: number): void;
  /** Returns null to hide the button for that slot (e.g. no skill equipped there). */
  getSlot(slot: number): SkillButtonSlot | null;
}

function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function attachSkillButtons(container: HTMLElement, adapter: SkillButtonsAdapter): { sync(): void; detach(): void } {
  if (!isTouchDevice()) {
    return { sync() {}, detach() {} };
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'skill-buttons';

  const buttons: HTMLButtonElement[] = [];
  const cleanups: Array<() => void> = [];

  for (let slot = 0; slot < SLOT_COUNT; slot++) {
    const button = document.createElement('button');
    button.className = 'skill-button';
    button.hidden = true;
    button.type = 'button';

    const onPress = (e: PointerEvent) => {
      e.preventDefault();
      adapter.press(slot);
    };
    const onRelease = () => adapter.release(slot);

    button.addEventListener('pointerdown', onPress);
    button.addEventListener('pointerup', onRelease);
    button.addEventListener('pointercancel', onRelease);
    button.addEventListener('pointerleave', onRelease);
    cleanups.push(() => {
      button.removeEventListener('pointerdown', onPress);
      button.removeEventListener('pointerup', onRelease);
      button.removeEventListener('pointercancel', onRelease);
      button.removeEventListener('pointerleave', onRelease);
    });

    buttons.push(button);
    wrapper.appendChild(button);
  }

  container.appendChild(wrapper);

  return {
    sync(): void {
      buttons.forEach((button, slot) => {
        const info = adapter.getSlot(slot);
        if (!info) {
          button.hidden = true;
          return;
        }
        button.hidden = false;
        button.textContent = `${slot + 1}\n${info.label.toUpperCase()}`;
        button.style.setProperty('--skill-color', info.color);
        button.dataset.empty = String(info.empty);
      });
    },
    detach(): void {
      cleanups.forEach(fn => fn());
      wrapper.remove();
    },
  };
}
