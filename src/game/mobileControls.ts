import { SHOP_SKILLS, type SkillId } from './skills/data';
import { pressSkillSlot, releaseSkillSlot } from './input';
import { isSkillVisuallyActive } from './skills/skills';
import { skillState } from './skills/state';
import { world } from './state';

const SLOT_COUNT = 3;

function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function attachSkillButtons(container: HTMLElement): { sync(): void; detach(): void } {
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
      pressSkillSlot(slot);
    };
    const onRelease = () => releaseSkillSlot(slot);

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
      const equipped = world.gameData.equippedOrder as SkillId[];
      const inPlay = world.state === 'play';
      buttons.forEach((button, slot) => {
        const id = equipped[slot];
        if (!id || !inPlay) {
          button.hidden = true;
          return;
        }
        const skill = SHOP_SKILLS.find(s => s.id === id)!;
        const active = isSkillVisuallyActive(id);
        const charges = skillState.charges[id];
        button.hidden = false;
        button.textContent = `${slot + 1}\n${skill.label.toUpperCase()}`;
        button.style.setProperty('--skill-color', skill.color);
        button.dataset.empty = String(!active && charges <= 0);
      });
    },
    detach(): void {
      cleanups.forEach(fn => fn());
      wrapper.remove();
    },
  };
}
