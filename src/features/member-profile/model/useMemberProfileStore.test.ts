import { beforeEach, describe, expect, it } from 'vitest';

import { useMemberProfileStore } from './useMemberProfileStore';

describe('member profile center state', () => {
  beforeEach(() => {
    useMemberProfileStore.setState({
      contact: { phone: '', address: '', avatarDataUrl: null },
      security: {
        twoFactorEnabled: false,
        loginAlerts: true,
        sessionTimeoutMinutes: 60,
        lastPasswordChangedAt: null,
      },
      wearables: [
        { id: 'apple_health', connected: false, lastSyncedAt: null },
        { id: 'google_fit', connected: true, lastSyncedAt: '2026-09-26T02:15:00.000Z' },
        { id: 'garmin', connected: false, lastSyncedAt: null },
        { id: 'fitbit', connected: false, lastSyncedAt: null },
      ],
    });
  });

  it('persists editable contact information separately from health data', () => {
    useMemberProfileStore.getState().updateContact({
      phone: '+84 912 345 678',
      address: 'Thảo Điền, Ho Chi Minh City',
      avatarDataUrl: null,
    });

    expect(useMemberProfileStore.getState().contact).toMatchObject({
      phone: '+84 912 345 678',
      address: 'Thảo Điền, Ho Chi Minh City',
    });
  });

  it('connects, synchronizes and disconnects a wearable', () => {
    useMemberProfileStore.getState().toggleWearable('garmin');
    expect(
      useMemberProfileStore.getState().wearables.find((item) => item.id === 'garmin'),
    ).toMatchObject({ connected: true });

    useMemberProfileStore.getState().syncWearable('garmin');
    expect(
      useMemberProfileStore.getState().wearables.find((item) => item.id === 'garmin')?.lastSyncedAt,
    ).toBeTruthy();

    useMemberProfileStore.getState().toggleWearable('garmin');
    expect(
      useMemberProfileStore.getState().wearables.find((item) => item.id === 'garmin'),
    ).toMatchObject({ connected: false, lastSyncedAt: null });
  });

  it('marks individual and all notifications as read', () => {
    useMemberProfileStore.setState({
      notifications: [
        {
          id: 'one',
          category: 'workout',
          title: { en: 'One', vi: 'Một' },
          body: { en: 'Body', vi: 'Nội dung' },
          createdAt: '2026-09-26T00:00:00.000Z',
          read: false,
          target: '/app/workout',
        },
        {
          id: 'two',
          category: 'assessment',
          title: { en: 'Two', vi: 'Hai' },
          body: { en: 'Body', vi: 'Nội dung' },
          createdAt: '2026-09-25T00:00:00.000Z',
          read: false,
          target: '/app/profile/assessments',
        },
      ],
    });

    useMemberProfileStore.getState().markNotificationRead('one');
    expect(useMemberProfileStore.getState().notifications[0]?.read).toBe(true);

    useMemberProfileStore.getState().markAllNotificationsRead();
    expect(useMemberProfileStore.getState().notifications.every((item) => item.read)).toBe(true);
  });
});
