import type { ShopTabId } from '../types';

export interface ColorItem {
  id: string;
  label: string;
  price: number;
  body: string;
  wing: string;
  glow: string;
  free?: boolean;
}

/** [position 0-1, CSS color] gradient stop, as passed to CanvasGradient.addColorStop. */
export type GradientStop = [number, string];

export type CapStyle =
  | 'straight'
  | 'hazard-stripe'
  | 'rounded'
  | 'diamond-notch'
  | 'ringed-segments'
  | 'crystal-spike';

export interface PipeItem {
  id: string;
  label: string;
  price: number;
  free?: boolean;
  capStyle: CapStyle;
  barrelColors: GradientStop[];
  capColors: GradientStop[];
  stripeColor: string;
  scanlineColor: string;
  /** "r,g,b" — no leading #, used inside rgba(${...}, alpha) templates. */
  barrelGlow: string;
  capGlow: string;
  edgeGlow: string;
  capH: number;
  overhang: number;
}

export type DecorKind = 'stars' | 'fireflies' | 'bubbles' | 'sandhaze' | 'snowflakes' | 'embers';

export interface GlowAccent {
  x: number;
  y: number;
  r: number;
  color: string;
}

export interface BackgroundItem {
  id: string;
  label: string;
  price: number;
  free?: boolean;
  sky: GradientStop[];
  floor: { top: string; bottom: string };
  horizon: string;
  grid: string;
  decor: { kind: DecorKind; color: string; count: number };
  glowAccent: GlowAccent | null;
}

export interface ShopTabDef {
  id: ShopTabId;
  label: string;
}

export type PropsSubTabId = 'colors' | 'hats' | 'glasses' | 'masks' | 'shoes';

export interface PropsSubTabDef {
  id: PropsSubTabId;
  label: string;
}

export type HatStyle =
  | 'cap' | 'top-hat' | 'beanie' | 'crown' | 'headband' | 'party' | 'helmet' | 'halo';

export interface HatItem {
  id: string;
  label: string;
  price: number;
  free?: boolean;
  style: HatStyle;
  primary: string;
  accent: string;
}

export type GlassesStyle =
  | 'round' | 'square' | 'aviator' | 'star' | 'heart' | 'visor' | 'monocle' | 'ski';

export interface GlassesItem {
  id: string;
  label: string;
  price: number;
  free?: boolean;
  style: GlassesStyle;
  frame: string;
  lens: string;
}

export type MaskStyle =
  | 'bandit' | 'ninja' | 'hero' | 'robot' | 'skull' | 'plague' | 'carnival' | 'tribal';

export interface MaskItem {
  id: string;
  label: string;
  price: number;
  free?: boolean;
  style: MaskStyle;
  primary: string;
  accent: string;
}

export type ShoeStyle =
  | 'sneaker' | 'boot' | 'sandal' | 'cleats' | 'roller' | 'clown' | 'armor' | 'ballet';

export interface ShoeItem {
  id: string;
  label: string;
  price: number;
  free?: boolean;
  style: ShoeStyle;
  primary: string;
  sole: string;
}

/** Common shape shared by colors/pipes/backgrounds/props for the generic purchase/equip helper. */
export interface CollectibleItem {
  id: string;
  price: number;
  free?: boolean;
}
