import type { AuthResponseDto } from './types';

import type { AuthSession, Role } from '@/entities/user';

export type { AuthResponseDto };

// Backend role names (case-insensitive) -> FE roles. "User" is the SRS name for a member.
const ROLE_MAP: Readonly<Record<string, Role>> = {
  user: 'member',
  member: 'member',
  pt: 'pt',
  trainer: 'pt',
  gymadmin: 'gym_admin',
  gymowner: 'gym_admin',
  branchmanager: 'branch_manager',
  platformadmin: 'super_admin',
  superadmin: 'super_admin',
};

export function mapRoles(backendRoles: ReadonlyArray<string>): Role[] {
  const roles = new Set<Role>();
  for (const name of backendRoles) {
    const role = ROLE_MAP[name.replace(/[\s_-]/g, '').toLowerCase()];
    if (role) roles.add(role);
  }
  return [...roles];
}

export function mapAuthResponse(dto: AuthResponseDto): AuthSession {
  return {
    user: {
      id: dto.userId,
      email: dto.email,
      fullName: dto.fullName,
      roles: mapRoles(dto.roles),
    },
    tokens: { accessToken: dto.accessToken, refreshToken: dto.refreshToken },
  };
}
