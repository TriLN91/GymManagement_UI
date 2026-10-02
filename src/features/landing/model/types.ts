export type LandingAudience = 'member' | 'gym_owner';

export interface HeroMotion {
  progress: number;
  reveal: number;
  floatTime: number;
  invalidate: () => void;
}
