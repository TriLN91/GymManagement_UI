import { describe, expect, it } from 'vitest';

import { mapAuthResponse, mapRoles } from './mappers';

describe('mapRoles', () => {
  it('maps backend role names to FE roles regardless of case', () => {
    expect(mapRoles(['Member'])).toEqual(['member']);
    expect(mapRoles(['User'])).toEqual(['member']);
    expect(mapRoles(['Trainer'])).toEqual(['pt']);
    expect(mapRoles(['PT'])).toEqual(['pt']);
    expect(mapRoles(['GymAdmin'])).toEqual(['gym_admin']);
    expect(mapRoles(['PlatformAdmin'])).toEqual(['super_admin']);
    expect(mapRoles(['SuperAdmin'])).toEqual(['super_admin']);
  });

  it('drops unknown roles and removes duplicates', () => {
    expect(mapRoles(['Member', 'User', 'Mystery'])).toEqual(['member']);
    expect(mapRoles([])).toEqual([]);
  });
});

describe('mapAuthResponse', () => {
  it('converts the flat backend response into an AuthSession', () => {
    const session = mapAuthResponse({
      userId: 'u-1',
      fullName: 'Maya',
      email: 'maya@demo.gym',
      accessToken: 'a',
      refreshToken: 'r',
      roles: ['Trainer', 'GymAdmin'],
    });
    expect(session.user).toEqual({
      id: 'u-1',
      email: 'maya@demo.gym',
      fullName: 'Maya',
      roles: ['pt', 'gym_admin'],
    });
    expect(session.tokens).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });
});
