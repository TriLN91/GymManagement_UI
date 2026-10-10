export interface PlatformGym {
  id: string;
  name: string;
  owner: string;
  address: string;
  joinedAt: string;
  trainers: ReadonlyArray<PlatformGymTrainer>;
  members: ReadonlyArray<PlatformGymMember>;
  appointments: ReadonlyArray<PlatformGymAppointment>;
  offers: ReadonlyArray<{ id: string; name: string; type: string; status: 'published' | 'paused' }>;
  events: ReadonlyArray<{
    id: string;
    name: string;
    date: string;
    status: 'upcoming' | 'completed';
  }>;
}

export interface PlatformGymTrainer {
  id: string;
  name: string;
  email: string;
  specialization: string;
  status: 'active' | 'hidden';
}

export interface PlatformGymMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  trainerId?: string;
  status: 'active' | 'paused';
}

export interface PlatformGymAppointment {
  id: string;
  trainerId: string;
  memberId: string;
  date: string;
  time: string;
  durationMinutes: number;
  type: 'coaching' | 'assessment' | 'plan_review';
  status: 'confirmed' | 'pending';
}
