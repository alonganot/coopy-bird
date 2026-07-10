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

/** Common shape shared by colors/pipes/backgrounds for the generic purchase/equip helper. */
export interface CollectibleItem {
  id: string;
  price: number;
  free?: boolean;
}
