export function isNavigationRouteActive(pathname: string, destination?: string) {
  if (!destination) return false;
  return pathname === destination || pathname.startsWith(`${destination}/`);
}
