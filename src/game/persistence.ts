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
  unlockedHats: string[];
  /** Empty string means "no hat equipped" — unlike colors/pipes/backgrounds, bare is a valid default. */
  activeHat: string;
  unlockedGlasses: string[];
  activeGlasses: string;
  unlockedMasks: string[];
  activeMask: string;
  unlockedShoes: string[];
  activeShoe: string;
  unlockedSkills: SkillId[];
  /** Always fully populated (one entry per SHOP_SKILLS) by migrateSkillData before use. */
  activeSkills: Record<SkillId, boolean>;
  equippedOrder: SkillId[];
}

/** Fills in defaults for any missing/legacy field — applied to whatever the server returns for a username, same as it once was applied to a raw localStorage blob. */
export function migrateData(d: Partial<GameData>): GameData {
  if (!d.totalCoins) d.totalCoins = 0;
  if (!d.highScores) d.highScores = [];
  if (!d.unlockedColors) d.unlockedColors = ['yellow'];
  if (!d.activeColor) d.activeColor = 'yellow';
  if (!d.unlockedPipes) d.unlockedPipes = ['default'];
  if (!d.activePipe) d.activePipe = 'default';
  if (!d.unlockedBackgrounds) d.unlockedBackgrounds = ['default'];
  if (!d.activeBackground) d.activeBackground = 'default';
  if (!d.unlockedHats) d.unlockedHats = [];
  if (d.activeHat === undefined) d.activeHat = '';
  if (!d.unlockedGlasses) d.unlockedGlasses = [];
  if (d.activeGlasses === undefined) d.activeGlasses = '';
  if (!d.unlockedMasks) d.unlockedMasks = [];
  if (d.activeMask === undefined) d.activeMask = '';
  if (!d.unlockedShoes) d.unlockedShoes = [];
  if (d.activeShoe === undefined) d.activeShoe = '';
  return migrateSkillData(d as GameData);
}

const USERNAME_STORAGE_KEY = 'coopyBirdUsername';

/**
 * The only thing left in localStorage: which username this device last logged in as.
 * The actual save data (GameData) lives server-side in Postgres, keyed by that username.
 */
export function getStoredUsername(): string | null {
  try {
    return localStorage.getItem(USERNAME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredUsername(username: string): void {
  try {
    localStorage.setItem(USERNAME_STORAGE_KEY, username);
  } catch {
    // localStorage unavailable (private browsing, quota) — username just won't be remembered next visit.
  }
}
