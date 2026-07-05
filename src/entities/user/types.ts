// FR-IAM-02: RBAC roles drive route isolation.
// Roles are stored as an array — a user MAY belong to multiple roles (e.g. pt + gym_admin).
export type Role = 'member' | 'pt' | 'gym_admin' | 'super_admin';
export const ALL_ROLES: ReadonlyArray<Role> = ['member', 'pt', 'gym_admin', 'super_admin'];

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
  tenantId: string;
  avatarUrl?: string;
  locale?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
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
}
