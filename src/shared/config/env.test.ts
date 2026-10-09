import { describe, expect, it, vi } from 'vitest';

import { parseEnv } from './env';

describe('parseEnv', () => {
  it('parses a numeric string for VITE_API_TIMEOUT_MS', () => {
    expect(parseEnv({ VITE_API_TIMEOUT_MS: '5000' }, false).VITE_API_TIMEOUT_MS).toBe(5000);
  });

  it('rejects an invalid API base URL', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => parseEnv({ VITE_API_BASE_URL: 'not-a-url' }, false)).toThrow();
  });

  it('enables MSW by default in dev and disables it in production', () => {
    expect(parseEnv({}, false).VITE_ENABLE_MSW).toBe(true);
    expect(parseEnv({}, true).VITE_ENABLE_MSW).toBe(false);
  });

  it('treats the string "false" as false', () => {
    expect(parseEnv({ VITE_ENABLE_MSW: 'false' }, false).VITE_ENABLE_MSW).toBe(false);
  });

  it('treats the string "true" as true even in production', () => {
    expect(parseEnv({ VITE_ENABLE_MSW: 'true' }, true).VITE_ENABLE_MSW).toBe(true);
  });

  it('rejects other values for VITE_ENABLE_MSW', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => parseEnv({ VITE_ENABLE_MSW: '1' }, false)).toThrow();
  });
});
