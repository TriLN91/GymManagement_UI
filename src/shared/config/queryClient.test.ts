import { describe, expect, it } from 'vitest';

import { queryClient } from './queryClient';

import { AuthError, ValidationError } from '@/shared/api/errorTypes';


describe('queryClient', () => {
  it('does not retry on AuthError', () => {
    const retry = queryClient.getDefaultOptions().queries?.retry;
    expect(typeof retry).toBe('function');
    expect((retry as (n: number, e: unknown) => boolean)(0, new AuthError(401, 'x'))).toBe(false);
  });

  it('does not retry on ValidationError', () => {
    const retry = queryClient.getDefaultOptions().queries?.retry;
    expect((retry as (n: number, e: unknown) => boolean)(0, new ValidationError(422, 'x', {}))).toBe(
      false,
    );
  });

  it('retries transient errors up to 2 times', () => {
    const retry = queryClient.getDefaultOptions().queries?.retry;
    const err = new Error('boom');
    expect((retry as (n: number, e: unknown) => boolean)(0, err)).toBe(true);
    expect((retry as (n: number, e: unknown) => boolean)(1, err)).toBe(true);
    expect((retry as (n: number, e: unknown) => boolean)(2, err)).toBe(false);
  });

  it('never retries mutations', () => {
    expect(queryClient.getDefaultOptions().mutations?.retry).toBe(0);
  });
});
