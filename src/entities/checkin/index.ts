// CheckIn — domain entity.
export interface CheckIn {
  id: string;
  memberId: string;
  weightKg: number;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  notes: string;
  submittedAt: string;
}

export interface CheckInPayload {
  weightKg: number;
  energyLevel: CheckIn['energyLevel'];
  notes: string;
}