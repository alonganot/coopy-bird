export type SkillId =
  | 'dash'
  | 'shooting'
  | 'invisibility'
  | 'timeSlow'
  | 'shrink'
  | 'hover'
  | 'earthquake'
  | 'freezeFrame'
  | 'shadowClone';

export interface SkillItem {
  id: SkillId;
  label: string;
  description: string;
  price: number;
  chargeThreshold: number;
  duration: number;
  color: string;
}

export const MAX_EQUIPPED_SKILLS = 3;

export const SHOP_SKILLS: SkillItem[] = [
  { id: 'dash', label: 'Dash', description: 'Speed boost & pipe destroyer', price: 100, chargeThreshold: 5, duration: 14, color: '#00f7ff' },
  { id: 'shooting', label: 'Shooting', description: 'Destroy pipes with projectiles', price: 350, chargeThreshold: 8, duration: 30, color: '#fdcb6e' },
  { id: 'invisibility', label: 'Invisibility', description: 'Ghost through pipes safely', price: 500, chargeThreshold: 10, duration: 100, color: '#a29bfe' },
  { id: 'timeSlow', label: 'Pocket Dimension', description: 'Slow physics 50% briefly', price: 600, chargeThreshold: 10, duration: 240, color: '#00ffcc' },
  { id: 'shrink', label: 'Shrink', description: 'Halve your hitbox & size', price: 700, chargeThreshold: 9, duration: 300, color: '#ff9ff3' },
  { id: 'hover', label: 'Hover', description: 'Hold to glide, slows your fall', price: 800, chargeThreshold: 9, duration: 180, color: '#c7ecee' },
  { id: 'earthquake', label: 'Earthquake', description: 'Sink the next pipe pair', price: 1000, chargeThreshold: 12, duration: 24, color: '#e17055' },
  { id: 'freezeFrame', label: 'Freeze Frame', description: 'Stop the scroll for 3 seconds', price: 1500, chargeThreshold: 10, duration: 180, color: '#74b9ff' },
  { id: 'shadowClone', label: 'Shadow Clone', description: 'Mirrored clone, coins x2', price: 2000, chargeThreshold: 15, duration: 0, color: '#636e72' },
];
