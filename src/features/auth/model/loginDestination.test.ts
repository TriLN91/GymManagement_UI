import { describe, expect, it } from 'vitest';

import { resolveLoginDestination } from './loginDestination';

describe('resolveLoginDestination', () => {
  it('goes to the role portal when there is no returnTo', () => {
    expect(resolveLoginDestination(['member'], undefined)).toBe('/app');
    expect(resolveLoginDestination(['pt'], null)).toBe('/pt');
    expect(resolveLoginDestination(['gym_admin'], undefined)).toBe('/admin');
    expect(resolveLoginDestination(['super_admin'], undefined)).toBe('/superadmin');
  });

  it('returns to the original page when it is inside the user portal', () => {
    expect(resolveLoginDestination(['member'], '/app/workout')).toBe('/app/workout');
  });

  it('ignores a returnTo from another portal or an external URL', () => {
    expect(resolveLoginDestination(['member'], '/admin/orders')).toBe('/app');
    expect(resolveLoginDestination(['member'], '/application')).toBe('/app');
    expect(resolveLoginDestination(['member'], 'https://evil.example')).toBe('/app');
  });
});
