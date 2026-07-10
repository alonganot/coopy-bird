import type { SkillId } from './skills/data';
import { migrateSkillData } from './skills/state';

export interface GameData {
  totalCoins: number;
  highScores: number[];
  unlockedColors: string[];
  activeColor: string;
  unlockedPipes: string[];
  activePipe: string;
  unlockedBackgrounds: string[];
  activeBackground: string;
  unlockedSkills: SkillId[];
  /** Always fully populated (one entry per SHOP_SKILLS) by migrateSkillData before use. */
  activeSkills: Record<SkillId, boolean>;
  equippedOrder: SkillId[];
  /** Chosen once via the multiplayer name-entry prompt; empty string means "not yet chosen". */
  displayName: string;
}

const STORAGE_KEY = 'flappyData';

export function loadData(): Partial<GameData> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') || {};
  } catch {
    return {};
  }
}

export function migrateData(d: Partial<GameData>): GameData {
  if (!d.totalCoins) d.totalCoins = 0;
  if (!d.highScores) d.highScores = [];
  if (!d.unlockedColors) d.unlockedColors = ['yellow'];
  if (!d.activeColor) d.activeColor = 'yellow';
  if (!d.unlockedPipes) d.unlockedPipes = ['default'];
  if (!d.activePipe) d.activePipe = 'default';
  if (!d.unlockedBackgrounds) d.unlockedBackgrounds = ['default'];
  if (!d.activeBackground) d.activeBackground = 'default';
  if (d.displayName === undefined) d.displayName = '';
  return migrateSkillData(d as GameData);
}

export function saveData(gameData: GameData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameData));
}
