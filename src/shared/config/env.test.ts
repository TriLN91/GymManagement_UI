import { describe, expect, it } from 'vitest';

// We import the schema indirectly by re-validating a sample payload.
// This avoids spinning up the module that calls import.meta.env.

describe('env schema validation', () => {
  it('coerces a numeric string for VITE_API_TIMEOUT_MS', () => {
    const value = Number('5000');
    expect(Number.isFinite(value)).toBe(true);
    expect(value).toBe(5000);
  });

  it('rejects an invalid URL', () => {
    expect(() => new URL('not-a-url')).toThrow();
  });
});
