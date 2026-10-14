import { ROUTES } from '@/shared/config/constants';

export const portalForRole = (roles: ReadonlyArray<string>): string => {
  if (roles.includes('super_admin')) return ROUTES.superadmin.root;
  if (roles.includes('gym_admin')) return ROUTES.admin.root;
  if (roles.includes('pt')) return ROUTES.pt.root;
  return ROUTES.member.root;
};

// Honour the page that sent the user to /login, but only inside the portal their role may open.
export const resolveLoginDestination = (
  roles: ReadonlyArray<string>,
  returnTo: unknown,
): string => {
  const portal = portalForRole(roles);
  if (typeof returnTo !== 'string') return portal;
  return returnTo === portal || returnTo.startsWith(`${portal}/`) ? returnTo : portal;
};
