import type { Clone } from '../types';
import { MAX_EQUIPPED_SKILLS, SHOP_SKILLS, type SkillId } from './data';
import type { GameData } from '../persistence';

export interface SkillState {
  charges: Record<SkillId, number>;
  activeTimer: Record<SkillId, number>;
  hoverHeld: boolean;
  clone: Clone | null;
  shopMessage: string;
  shopMessageTimer: number;
}

function emptyChargeMap(): Record<SkillId, number> {
  const map = {} as Record<SkillId, number>;
  SHOP_SKILLS.forEach(s => { map[s.id] = 0; });
  return map;
}

export const skillState: SkillState = {
  charges: emptyChargeMap(),
  activeTimer: emptyChargeMap(),
  hoverHeld: false,
  clone: null,
  shopMessage: '',
  shopMessageTimer: 0,
};

export function initSkillState(): void {
  skillState.charges = emptyChargeMap();
  skillState.activeTimer = emptyChargeMap();
  skillState.hoverHeld = false;
  skillState.clone = null;
  skillState.shopMessage = '';
  skillState.shopMessageTimer = 0;
}

/** Backfills skill-related fields on a persisted save; mutates and returns d. */
export function migrateSkillData(d: GameData): GameData {
  if (!d.unlockedSkills) d.unlockedSkills = [];
  if (!d.activeSkills) d.activeSkills = {} as Record<SkillId, boolean>;
  if (!d.equippedOrder) {
    // Backfill from legacy boolean-only saves (pre-slot system)
    d.equippedOrder = SHOP_SKILLS.filter(s => d.activeSkills[s.id]).map(s => s.id).slice(0, MAX_EQUIPPED_SKILLS);
  }
  SHOP_SKILLS.forEach(s => { d.activeSkills[s.id] = d.equippedOrder.includes(s.id); });
  return d;
}
