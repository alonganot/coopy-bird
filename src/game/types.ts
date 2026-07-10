export type GameState = 'idle' | 'play' | 'dead';
export type ShopTabId = 'colors' | 'skills' | 'pipes' | 'bg';

export interface Bird {
  x: number;
  y: number;
  vy: number;
  r: number;
  thrustAnim: number;
}

export interface Pipe {
  x: number;
  topH: number;
  passed: boolean;
  glowPhase: number;
  destroyed?: boolean;
  sinking?: boolean;
  sinkTimer?: number;
  sinkDuration?: number;
}

export type ParticleType = 'spark' | 'debris' | 'text' | 'shimmer';

export interface Particle {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  life: number;
  type: ParticleType;
  color?: string;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  hit?: boolean;
}

export interface DecorParticle {
  x: number;
  y: number;
  r: number;
  phase: number;
  speed: number;
}

export interface Clone {
  y: number;
  vy: number;
  r: number;
  alive: boolean;
}

/** Anything with a hitbox radius, used generically by collision code. */
export interface Collidable {
  x: number;
  y: number;
  r: number;
}
