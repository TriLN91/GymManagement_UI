// FR-IAM-02: RBAC roles drive route isolation (Platform Admin > Gym Admin > PT > User).
// Roles are stored as an array — a user MAY belong to multiple roles (e.g. pt + gym_admin).
import type { SessionUser } from '@/shared/config/roles';
export { ALL_ROLES, type Role } from '@/shared/config/roles';

export type AuthUser = SessionUser;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  /** Required when role is GymAdmin. */
  gymName?: string;
}

/** Gym Admin self-registration; the account must be approved by a Platform Admin before sign-in. */
export interface RegisterGymAdminPayload extends RegisterPayload {
  gymName: string;
}

export interface PendingRegistration {
  userId: string;
  email: string;
  fullName: string;
  status: 'PendingApproval';
  gymId: string;
  gymName: string;
}
