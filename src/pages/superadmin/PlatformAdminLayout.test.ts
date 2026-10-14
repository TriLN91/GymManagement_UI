import { describe, expect, it } from 'vitest';

import { isNavigationRouteActive } from './navigationRoute';

describe('Platform Admin navigation matching', () => {
  it('keeps Exercise references active on nested preparation routes', () => {
    expect(
      isNavigationRouteActive(
        '/superadmin/movement-assessment/reference-sets/set-1',
        '/superadmin/movement-assessment',
      ),
    ).toBe(true);
  });

  it('does not activate a route that only shares a partial prefix', () => {
    expect(
      isNavigationRouteActive(
        '/superadmin/movement-assessment-archive',
        '/superadmin/movement-assessment',
      ),
    ).toBe(false);
  });
});
