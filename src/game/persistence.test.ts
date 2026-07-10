import { describe, expect, it } from 'vitest';
import { migrateData, type GameData } from './persistence';

describe('migrateData', () => {
  it('populates all defaults for a fresh install (empty object)', () => {
    const d = migrateData({});
    expect(d.totalCoins).toBe(0);
    expect(d.highScores).toEqual([]);
    expect(d.unlockedColors).toEqual(['yellow']);
    expect(d.activeColor).toBe('yellow');
    expect(d.unlockedPipes).toEqual(['default']);
    expect(d.activePipe).toBe('default');
    expect(d.unlockedBackgrounds).toEqual(['default']);
    expect(d.activeBackground).toBe('default');
    expect(d.unlockedSkills).toEqual([]);
    expect(d.equippedOrder).toEqual([]);
    expect(d.activeSkills.dash).toBe(false);
    expect(d.activeSkills.shadowClone).toBe(false);
  });

  it('backfills a legacy pre-skills save with no skill fields at all', () => {
    const legacy = {
      totalCoins: 250,
      highScores: [12, 8],
      unlockedColors: ['yellow', 'sky'],
      activeColor: 'sky',
      unlockedPipes: ['default'],
      activePipe: 'default',
      unlockedBackgrounds: ['default'],
      activeBackground: 'default',
    } as Partial<GameData>;

    const d = migrateData(legacy);
    expect(d.totalCoins).toBe(250);
    expect(d.unlockedSkills).toEqual([]);
    expect(d.equippedOrder).toEqual([]);
    expect(d.activeSkills.dash).toBe(false);
  });

  it('converts a legacy boolean-only skills save (pre-slot system) into equippedOrder', () => {
    const legacy = {
      totalCoins: 5000,
      unlockedSkills: ['dash', 'shooting', 'invisibility', 'shrink'],
      activeSkills: { dash: true, shooting: false, invisibility: true, shrink: true },
    } as unknown as Partial<GameData>;

    const d = migrateData(legacy);
    // Only 3 slots max, in SHOP_SKILLS order: dash, invisibility, shrink
    expect(d.equippedOrder).toEqual(['dash', 'invisibility', 'shrink']);
    expect(d.activeSkills.dash).toBe(true);
    expect(d.activeSkills.invisibility).toBe(true);
    expect(d.activeSkills.shrink).toBe(true);
    expect(d.activeSkills.shooting).toBe(false);
  });

  it('passes an already up-to-date save through unchanged (idempotent)', () => {
    const current: GameData = {
      totalCoins: 42,
      highScores: [3, 2, 1],
      unlockedColors: ['yellow'],
      activeColor: 'yellow',
      unlockedPipes: ['default'],
      activePipe: 'default',
      unlockedBackgrounds: ['default'],
      activeBackground: 'default',
      unlockedSkills: ['dash'],
      equippedOrder: ['dash'],
      activeSkills: { dash: true } as GameData['activeSkills'],
      displayName: 'Ami',
    };

    const d = migrateData({ ...current });
    expect(d.totalCoins).toBe(42);
    expect(d.equippedOrder).toEqual(['dash']);
    expect(d.unlockedSkills).toEqual(['dash']);
    expect(d.activeSkills.dash).toBe(true);
    expect(d.displayName).toBe('Ami');
  });

  it('defaults displayName to an empty string when missing (not yet chosen)', () => {
    const d = migrateData({});
    expect(d.displayName).toBe('');
  });
});
