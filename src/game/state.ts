import { pushGameData } from './api';
import { H, W } from './constants';
import { migrateData, type GameData } from './persistence';
import { getActiveBackgroundItem } from './shop/data';
import { initSkillState } from './skills/state';
import type { PropsSubTabId } from './shop/types';
import type {
  Bird,
  DecorParticle,
  GameState,
  Particle,
  Pipe,
  Projectile,
  ShopTabId,
} from './types';

export interface World {
  gameData: GameData;
  /** Empty until the username gate (see App.tsx) resolves a session; gates saveData() until then. */
  username: string;
  bird: Bird;
  pipes: Pipe[];
  frame: number;
  score: number;
  state: GameState;
  particles: Particle[];
  projectiles: Projectile[];
  decor: DecorParticle[];
  gridOffset: number;
  shopState: 'shop' | null;
  shopTab: ShopTabId;
  propsSubTab: PropsSubTabId;
  tick: number;
  glitchTimer: number;
  glitchActive: boolean;
  isNewBest: boolean;
}

function makeBird(): Bird {
  return { x: 80, y: H / 2, vy: 0, r: 18, thrustAnim: 0 };
}

export const world: World = {
  // Safe default until the username gate (App.tsx) fetches the real session from the server.
  gameData: migrateData({}),
  username: '',
  bird: makeBird(),
  pipes: [],
  frame: 0,
  score: 0,
  state: 'idle',
  particles: [],
  projectiles: [],
  decor: [],
  gridOffset: 0,
  shopState: null,
  shopTab: 'props',
  propsSubTab: 'colors',
  tick: 0,
  glitchTimer: 150,
  glitchActive: false,
  isNewBest: false,
};

export function saveData(): void {
  if (!world.username) return; // session not established yet (shouldn't happen post-gate, but stay safe)
  pushGameData(world.username, world.gameData);
}

export function makeDecor(): void {
  const n = getActiveBackgroundItem(world.gameData).decor.count || 80;
  world.decor = Array.from({ length: n }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.3,
    phase: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.3 + 0.05,
  }));
}

export function init(): void {
  world.bird = makeBird();
  world.pipes = [];
  world.particles = [];
  world.projectiles = [];
  world.frame = 0;
  world.score = 0;
  world.state = 'idle';
  world.gridOffset = 0;
  initSkillState();
  world.glitchTimer = 150;
  world.glitchActive = false;
  if (world.decor.length === 0) makeDecor();
}
