// MemberProfile — domain entity. Pure types only.
export interface MemberProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  goals: ReadonlyArray<string>;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface OnboardingPayload {
  fullName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  goals: ReadonlyArray<string>;
  experienceLevel: MemberProfile['experienceLevel'];
}