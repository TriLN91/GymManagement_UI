export type Role = 'member' | 'pt' | 'gym_admin' | 'branch_manager' | 'super_admin';
export const ALL_ROLES: ReadonlyArray<Role> = [
  'member',
  'pt',
  'gym_admin',
  'branch_manager',
  'super_admin',
];

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  roles: Role[];
  tenantId?: string;
  avatarUrl?: string;
  locale?: string;
}
