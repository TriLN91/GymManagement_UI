// Bodies of the backend MarketplaceApprovalsController trainer-service endpoints (what a Member buys with a PT).
export interface TrainerServiceDto {
  id: string;
  trainerProfileId: string;
  gymId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
  currencyCode: string;
  isActive: boolean;
}

/** The backend rejects unknown fields: send exactly these keys. */
export interface CreateTrainerServiceBody {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
}
