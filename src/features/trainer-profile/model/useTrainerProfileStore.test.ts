import { beforeEach, describe, expect, it } from 'vitest';

import { useTrainerProfileStore } from './useTrainerProfileStore';

describe('trainer profile state', () => {
  beforeEach(() => {
    useTrainerProfileStore.setState({
      profile: {
        phone: '',
        bio: '',
        specializations: [],
        experienceYears: null,
        selfIntroduction: '',
        avatarDataUrl: null,
      },
    });
  });

  it('updates editable trainer information without a gym field', () => {
    useTrainerProfileStore.getState().updateProfile({
      phone: '+84 900 000 000',
      bio: 'Strength coach',
      specializations: ['strength'],
      experienceYears: 6,
      selfIntroduction: 'Progress with intent.',
      avatarDataUrl: null,
    });

    expect(useTrainerProfileStore.getState().profile).toMatchObject({
      phone: '+84 900 000 000',
      specializations: ['strength'],
      experienceYears: 6,
    });
    expect(useTrainerProfileStore.getState().profile).not.toHaveProperty('gymId');
  });
});
