import { describe, expect, it } from 'vitest';

import { ApiError, AuthError, NetworkError, ValidationError } from './errorTypes';

describe('error types', () => {
  it('ApiError captures status, code, and details', () => {
    const err = new ApiError(500, 'boom', 'INTERNAL', { trace: 'xyz' });
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ApiError');
    expect(err.status).toBe(500);
    expect(err.message).toBe('boom');
    expect(err.code).toBe('INTERNAL');
    expect(err.details).toEqual({ trace: 'xyz' });
  });

  it('AuthError extends ApiError with a specific name', () => {
    const err = new AuthError(401, 'unauthorized', 'AUTH');
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toBeInstanceOf(AuthError);
    expect(err.name).toBe('AuthError');
    expect(err.status).toBe(401);
  });

  it('ValidationError carries a fieldErrors map', () => {
    const err = new ValidationError(422, 'invalid', { email: ['required'] }, 'VAL');
    expect(err).toBeInstanceOf(ApiError);
    expect(err.name).toBe('ValidationError');
    expect(err.fieldErrors).toEqual({ email: ['required'] });
  });

  it('NetworkError has a default message and the right name', () => {
    const err = new NetworkError();
    expect(err.name).toBe('NetworkError');
    expect(err.message).toBe('Network error');
  });
});
