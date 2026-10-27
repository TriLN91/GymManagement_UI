import { ROUTES } from '@/shared/config/constants';

export const portalForRole = (roles: ReadonlyArray<string>): string => {
  if (roles.includes('super_admin')) return ROUTES.superadmin.root;
  if (roles.includes('gym_admin')) return ROUTES.admin.root;
  if (roles.includes('branch_manager')) return ROUTES.branch.root;
  if (roles.includes('pt')) return ROUTES.pt.root;
  return roles.includes('member') ? ROUTES.member.root : ROUTES.public.landing;
};

// Honour the page that sent the user to /login, but only inside the portal their role may open.
export const resolveLoginDestination = (
  roles: ReadonlyArray<string>,
  returnTo: unknown,
): string => {
  const portal = portalForRole(roles);
  if (
    typeof returnTo !== 'string' ||
    !returnTo.startsWith('/') ||
    returnTo.startsWith('//') ||
    returnTo.includes('\\') ||
    [...returnTo].some((character) => character.charCodeAt(0) < 32)
  )
    return portal;
  const pathname = returnTo.split(/[?#]/)[0];
  const portals = [
    ['member', ROUTES.member.root],
    ['pt', ROUTES.pt.root],
    ['gym_admin', ROUTES.admin.root],
    ['branch_manager', ROUTES.branch.root],
    ['super_admin', ROUTES.superadmin.root],
  ];
  return portals.some(
    ([role, root]) =>
      roles.includes(role!) && (pathname === root || pathname?.startsWith(`${root}/`)),
  )
    ? returnTo
    : portal;
};
