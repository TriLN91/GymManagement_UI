// TrainerProfile — domain entity. Pure types only.
export interface TrainerProfile {
  id: string;
  fullName: string;
  bio: string;
  specialties: ReadonlyArray<string>;
  rating: number;
}

export interface TrainerPackage {
  id: string;
  trainerId: string;
  name: string;
  sessionsIncluded: number;
  priceCents: number;
}