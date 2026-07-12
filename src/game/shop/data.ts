import type { GameData } from '../persistence';
import type {
  BackgroundItem,
  ColorItem,
  GlassesItem,
  HatItem,
  MaskItem,
  PipeItem,
  PropsSubTabDef,
  ShoeItem,
  ShopTabDef,
} from './types';

export const SHOP_COLORS: ColorItem[] = [
  { id: 'yellow', label: 'Classic', price: 0, body: '#f9ca24', wing: '#f0932b', glow: '#f9ca2488', free: true },
  { id: 'sky', label: 'Sky', price: 10, body: '#74b9ff', wing: '#0984e3', glow: '#74b9ff88' },
  { id: 'rose', label: 'Rose', price: 20, body: '#fd79a8', wing: '#e84393', glow: '#fd79a888' },
  { id: 'mint', label: 'Mint', price: 30, body: '#55efc4', wing: '#00b894', glow: '#55efc488' },
  { id: 'fire', label: 'Fire', price: 50, body: '#ff7675', wing: '#d63031', glow: '#ff767588' },
  { id: 'purple', label: 'Royal', price: 750, body: '#a29bfe', wing: '#6c5ce7', glow: '#a29bfe88' },
  { id: 'gold', label: 'Gold', price: 1000, body: '#ffeaa7', wing: '#fdcb6e', glow: '#ffeaa788' },
  { id: 'legendary', label: 'Legendary', price: 6767, body: '#0f0f0f', wing: '#e84393', glow: '#e8439388' },
];

export const SHOP_PIPES: PipeItem[] = [
  { id: 'default', label: 'Neon Tube', price: 0, free: true, capStyle: 'straight',
    barrelColors: [[0, '#0a2a1a'], [0.3, '#0d4a2a'], [0.6, '#12603a'], [1, '#082015']],
    capColors: [[0, '#0a3520'], [0.4, '#1a7040'], [1, '#091a10']],
    stripeColor: '#00ffa0', scanlineColor: '#00ff88',
    barrelGlow: '0,255,160', capGlow: '0,255,140', edgeGlow: '0,255,180',
    capH: 22, overhang: 5 },
  { id: 'hazard', label: 'Hazard Stripe', price: 300, capStyle: 'hazard-stripe',
    barrelColors: [[0, '#1a1a05'], [0.3, '#332b00'], [0.6, '#4d3d00'], [1, '#0d0d00']],
    capColors: [[0, '#332b00'], [0.4, '#665500'], [1, '#1a1500']],
    stripeColor: '#ffcc00', scanlineColor: '#ffdd44',
    barrelGlow: '255,204,0', capGlow: '255,180,0', edgeGlow: '255,220,80',
    capH: 22, overhang: 5 },
  { id: 'gilded', label: 'Gilded Column', price: 600, capStyle: 'rounded',
    barrelColors: [[0, '#3a2a05'], [0.3, '#6b4a10'], [0.6, '#8a6a20'], [1, '#2a1c05']],
    capColors: [[0, '#4a3510'], [0.4, '#c9a227'], [1, '#2a1c05']],
    stripeColor: '#ffe08a', scanlineColor: '#ffd766',
    barrelGlow: '255,215,120', capGlow: '255,200,80', edgeGlow: '255,230,160',
    capH: 24, overhang: 6 },
  { id: 'sludge', label: 'Toxic Sludge', price: 1000, capStyle: 'diamond-notch',
    barrelColors: [[0, '#1a2a05'], [0.3, '#3d5a0a'], [0.6, '#5a7a10'], [1, '#0d1502']],
    capColors: [[0, '#2a3a05'], [0.4, '#7a9a1a'], [1, '#141d03']],
    stripeColor: '#c8ff4d', scanlineColor: '#aaff33',
    barrelGlow: '180,255,60', capGlow: '160,255,40', edgeGlow: '200,255,100',
    capH: 22, overhang: 5 },
  { id: 'void', label: 'Void Ring', price: 1500, capStyle: 'ringed-segments',
    barrelColors: [[0, '#1a0a2a'], [0.3, '#3a1050'], [0.6, '#5a1a70'], [1, '#100518']],
    capColors: [[0, '#2a0a3a'], [0.4, '#7a2a9a'], [1, '#180520']],
    stripeColor: '#e070ff', scanlineColor: '#c040ff',
    barrelGlow: '200,80,255', capGlow: '180,60,255', edgeGlow: '220,120,255',
    capH: 26, overhang: 5 },
  { id: 'prism', label: 'Prism Spike', price: 2000, capStyle: 'crystal-spike',
    barrelColors: [[0, '#0a2530'], [0.3, '#154a5f'], [0.6, '#1f6a85'], [1, '#05161c']],
    capColors: [[0, '#154050'], [0.4, '#4fd8ff'], [1, '#0a1f28']],
    stripeColor: '#c8f8ff', scanlineColor: '#8ff0ff',
    barrelGlow: '150,240,255', capGlow: '120,220,255', edgeGlow: '200,250,255',
    capH: 22, overhang: 5 },
];

export const SHOP_BACKGROUNDS: BackgroundItem[] = [
  { id: 'default', label: 'Synthwave', price: 0, free: true,
    sky: [[0, '#010818'], [0.5, '#020d2e'], [1, '#050520']],
    floor: { top: '#00f7ff33', bottom: '#00050a' },
    horizon: '#00f7ff', grid: '#00f7ff',
    decor: { kind: 'stars', color: '#ffffff', count: 80 }, glowAccent: null },
  { id: 'jungle', label: 'Jungle Canopy', price: 300,
    sky: [[0, '#03130a'], [0.55, '#0c3018'], [1, '#1a3a12']],
    floor: { top: '#2f5c1a55', bottom: '#0a1a06' },
    horizon: '#8fd14f', grid: '#5a8f3a',
    decor: { kind: 'fireflies', color: '#ffe066', count: 40 }, glowAccent: null },
  { id: 'ocean', label: 'Deep Ocean', price: 700,
    sky: [[0, '#0a3a55'], [0.5, '#052a44'], [1, '#01121f']],
    floor: { top: '#c9a24744', bottom: '#4a3a1a' },
    horizon: '#4fd0ff', grid: '#2a8fc0',
    decor: { kind: 'bubbles', color: '#bfefff', count: 50 }, glowAccent: null },
  { id: 'desert', label: 'Dune Storm', price: 1100,
    sky: [[0, '#e8a35c'], [0.5, '#c97a3a'], [1, '#7a4a1a']],
    floor: { top: '#d9a95c66', bottom: '#5a3a12' },
    horizon: '#ffb347', grid: '#c9822f',
    decor: { kind: 'sandhaze', color: '#e8c98a', count: 30 },
    glowAccent: { x: 300, y: 80, r: 55, color: '#fff6d0' } },
  { id: 'snow', label: 'Frostbound', price: 1600,
    sky: [[0, '#0d1a2e'], [0.5, '#1c2f4a'], [1, '#3a4f66']],
    floor: { top: '#dce8f055', bottom: '#e8f0f5' },
    horizon: '#cfe8ff', grid: '#9fc8e8',
    decor: { kind: 'snowflakes', color: '#ffffff', count: 70 }, glowAccent: null },
  { id: 'volcano', label: 'Volcano Ash', price: 2000,
    sky: [[0, '#0a0505'], [0.5, '#1a0808'], [1, '#3a0f0a']],
    floor: { top: '#ff5a1f66', bottom: '#1a0503' },
    horizon: '#ff5a1f', grid: '#8a2a12',
    decor: { kind: 'embers', color: '#ff8a3a', count: 35 },
    glowAccent: { x: 200, y: 560, r: 90, color: '#ff5a1f' } },
];

export const SHOP_TABS: ShopTabDef[] = [
  { id: 'props', label: 'PROPS' },
  { id: 'skills', label: 'SKILLS' },
  { id: 'pipes', label: 'PIPES' },
  { id: 'bg', label: 'SCENE' },
];

export const PROPS_SUB_TABS: PropsSubTabDef[] = [
  { id: 'colors', label: 'COLORS' },
  { id: 'hats', label: 'HATS' },
  { id: 'glasses', label: 'GLASSES' },
  { id: 'masks', label: 'MASKS' },
  { id: 'shoes', label: 'SHOES' },
];

export const SHOP_HATS: HatItem[] = [
  { id: 'cap', label: 'Backwards Cap', price: 100, style: 'cap', primary: '#ff4757', accent: '#ffffff' },
  { id: 'headband', label: 'Sport Headband', price: 250, style: 'headband', primary: '#2ed573', accent: '#ffffff' },
  { id: 'beanie', label: 'Cozy Beanie', price: 450, style: 'beanie', primary: '#5352ed', accent: '#dfe4ea' },
  { id: 'party', label: 'Party Hat', price: 700, style: 'party', primary: '#ff6b81', accent: '#ffd32a' },
  { id: 'top-hat', label: 'Top Hat', price: 950, style: 'top-hat', primary: '#1e1e2e', accent: '#eccc68' },
  { id: 'helmet', label: 'Space Helmet', price: 1250, style: 'helmet', primary: '#a4b0be', accent: '#00d2ff' },
  { id: 'crown', label: 'Royal Crown', price: 1600, style: 'crown', primary: '#eccc68', accent: '#ff6b81' },
  { id: 'halo', label: 'Halo', price: 2000, style: 'halo', primary: '#fffa65', accent: '#ffffff' },
];

export const SHOP_GLASSES: GlassesItem[] = [
  { id: 'round', label: 'Round Specs', price: 100, style: 'round', frame: '#2f3542', lens: '#70a1ff88' },
  { id: 'square', label: 'Square Frames', price: 250, style: 'square', frame: '#57606f', lens: '#a4b0be88' },
  { id: 'visor', label: 'Sport Visor', price: 450, style: 'visor', frame: '#2f3542', lens: '#ff6b6b99' },
  { id: 'monocle', label: 'Monocle', price: 700, style: 'monocle', frame: '#eccc68', lens: '#ffffff55' },
  { id: 'aviator', label: 'Aviators', price: 950, style: 'aviator', frame: '#eccc68', lens: '#2f354299' },
  { id: 'ski', label: 'Ski Goggles', price: 1250, style: 'ski', frame: '#ff4757', lens: '#7bed9f99' },
  { id: 'star', label: 'Star Shades', price: 1600, style: 'star', frame: '#ff6b81', lens: '#ffd32a99' },
  { id: 'heart', label: 'Heart Shades', price: 2000, style: 'heart', frame: '#ff4757', lens: '#ff6b8199' },
];

export const SHOP_MASKS: MaskItem[] = [
  { id: 'bandit', label: 'Bandit Mask', price: 100, style: 'bandit', primary: '#2f3542', accent: '#ffffff' },
  { id: 'carnival', label: 'Carnival Mask', price: 250, style: 'carnival', primary: '#eccc68', accent: '#ff6b81' },
  { id: 'ninja', label: 'Ninja Wrap', price: 450, style: 'ninja', primary: '#1e1e2e', accent: '#ff4757' },
  { id: 'tribal', label: 'Tribal Paint', price: 700, style: 'tribal', primary: '#2ed573', accent: '#fffa65' },
  { id: 'hero', label: 'Hero Mask', price: 950, style: 'hero', primary: '#1e90ff', accent: '#ffd32a' },
  { id: 'plague', label: 'Plague Doctor', price: 1250, style: 'plague', primary: '#2f3542', accent: '#dfe4ea' },
  { id: 'robot', label: 'Robot Visor', price: 1600, style: 'robot', primary: '#57606f', accent: '#00d2ff' },
  { id: 'skull', label: 'Skull Mask', price: 2000, style: 'skull', primary: '#dfe4ea', accent: '#1e1e2e' },
];

export const SHOP_SHOES: ShoeItem[] = [
  { id: 'sneaker', label: 'Sneakers', price: 100, style: 'sneaker', primary: '#ffffff', sole: '#ff4757' },
  { id: 'sandal', label: 'Sandals', price: 250, style: 'sandal', primary: '#a0522d', sole: '#deb887' },
  { id: 'boot', label: 'Work Boots', price: 450, style: 'boot', primary: '#8b5a2b', sole: '#2f3542' },
  { id: 'ballet', label: 'Ballet Flats', price: 700, style: 'ballet', primary: '#ff6b81', sole: '#ffb8c6' },
  { id: 'roller', label: 'Roller Skates', price: 950, style: 'roller', primary: '#ff4757', sole: '#eccc68' },
  { id: 'cleats', label: 'Cleats', price: 1250, style: 'cleats', primary: '#2ed573', sole: '#1e1e2e' },
  { id: 'clown', label: 'Clown Shoes', price: 1600, style: 'clown', primary: '#ff6b81', sole: '#fffa65' },
  { id: 'armor', label: 'Armored Boots', price: 2000, style: 'armor', primary: '#a4b0be', sole: '#eccc68' },
];

export function getActiveColorItem(gameData: GameData): ColorItem {
  return SHOP_COLORS.find(c => c.id === gameData.activeColor) ?? SHOP_COLORS[0];
}
export function getActivePipeItem(gameData: GameData): PipeItem {
  return SHOP_PIPES.find(p => p.id === gameData.activePipe) ?? SHOP_PIPES[0];
}
export function getActiveBackgroundItem(gameData: GameData): BackgroundItem {
  return SHOP_BACKGROUNDS.find(b => b.id === gameData.activeBackground) ?? SHOP_BACKGROUNDS[0];
}
export function getActiveHatItem(gameData: GameData): HatItem | null {
  return SHOP_HATS.find(h => h.id === gameData.activeHat) ?? null;
}
export function getActiveGlassesItem(gameData: GameData): GlassesItem | null {
  return SHOP_GLASSES.find(g => g.id === gameData.activeGlasses) ?? null;
}
export function getActiveMaskItem(gameData: GameData): MaskItem | null {
  return SHOP_MASKS.find(m => m.id === gameData.activeMask) ?? null;
}
export function getActiveShoeItem(gameData: GameData): ShoeItem | null {
  return SHOP_SHOES.find(s => s.id === gameData.activeShoe) ?? null;
}
