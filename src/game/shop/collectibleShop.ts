import { skillState } from '../skills/state';
import { saveData, world } from '../state';
import type { GameData } from '../persistence';
import type { CollectibleItem } from './types';

/**
 * Shared single-select buy-or-equip behavior for colors/pipes/backgrounds:
 * one active item per category, buy if not owned, equip either way.
 */
export function purchaseOrEquip<T extends CollectibleItem>(
  item: T,
  unlockedList: string[],
  activeKey: keyof GameData,
): boolean {
  if (unlockedList.includes(item.id)) {
    (world.gameData[activeKey] as string) = item.id;
    saveData();
    return true;
  }
  if (world.gameData.totalCoins >= item.price) {
    world.gameData.totalCoins -= item.price;
    unlockedList.push(item.id);
    (world.gameData[activeKey] as string) = item.id;
    saveData();
    return true;
  }
  skillState.shopMessage = 'NOT ENOUGH COINS';
  skillState.shopMessageTimer = 90;
  return false;
}
