import { beforeEach, describe, expect, it, vi } from 'vitest';

import { EMPTY_PROFILE } from '../model/profileSetupModel';

import { fitnessApi, syncProfileToBackend } from './fitnessApi';

const filled = {
  ...EMPTY_PROFILE,
  goals: { ...EMPTY_PROFILE.goals, primary: 'strength' as const },
  identity: { ...EMPTY_PROFILE.identity, weightKg: 80 },
};

describe('syncProfileToBackend', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends nothing for an empty profile', async () => {
    const goal = vi.spyOn(fitnessApi, 'saveGoal');
    await expect(syncProfileToBackend(EMPTY_PROFILE)).resolves.toEqual({ saved: [] });
    expect(goal).not.toHaveBeenCalled();
  });

  it('saves goal then body check-in in order and reports what was saved', async () => {
    const calls: string[] = [];
    vi.spyOn(fitnessApi, 'saveGoal').mockImplementation(() => {
      calls.push('goal');
      return Promise.resolve({});
    });
    vi.spyOn(fitnessApi, 'addBodyCheckin').mockImplementation(() => {
      calls.push('body');
      return Promise.resolve({});
    });

    const result = await syncProfileToBackend(filled);

    expect(result.saved).toEqual(['goal', 'body']);
    expect(calls).toEqual(['goal', 'body']);
  });

  it('stops at the first failing request', async () => {
    vi.spyOn(fitnessApi, 'saveGoal').mockRejectedValue(new Error('boom'));
    const body = vi.spyOn(fitnessApi, 'addBodyCheckin');

    await expect(syncProfileToBackend(filled)).rejects.toThrow('boom');
    expect(body).not.toHaveBeenCalled();
  });
});
