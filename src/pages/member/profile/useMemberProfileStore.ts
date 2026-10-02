import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MemberContactProfile {
  phone: string;
  address: string;
  avatarDataUrl: string | null;
}

export interface SecurityPreferences {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeoutMinutes: 30 | 60 | 120;
  lastPasswordChangedAt: string | null;
}

export interface WearableConnection {
  id: 'apple_health' | 'google_fit' | 'garmin' | 'fitbit';
  connected: boolean;
  lastSyncedAt: string | null;
}

export interface MemberNotification {
  id: string;
  category: 'workout' | 'assessment' | 'appointment' | 'marketplace';
  title: { en: string; vi: string };
  body: { en: string; vi: string };
  createdAt: string;
  read: boolean;
  target: string;
}

interface MemberProfileState {
  contact: MemberContactProfile;
  security: SecurityPreferences;
  wearables: WearableConnection[];
  notifications: MemberNotification[];
  updateContact: (contact: MemberContactProfile) => void;
  updateSecurity: (security: Partial<SecurityPreferences>) => void;
  recordPasswordChange: () => void;
  toggleWearable: (id: WearableConnection['id']) => void;
  syncWearable: (id: WearableConnection['id']) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

const initialNotifications: MemberNotification[] = [
  {
    id: 'notification-appointment-01',
    category: 'appointment',
    title: { en: 'PT appointment confirmed', vi: 'Lịch hẹn PT đã được xác nhận' },
    body: {
      en: 'Your technique review with Linh Nguyễn is confirmed.',
      vi: 'Buổi kiểm tra kỹ thuật với Linh Nguyễn đã được xác nhận.',
    },
    createdAt: '2026-09-26T03:20:00.000Z',
    read: false,
    target: '/app/profile/appointments',
  },
  {
    id: 'notification-assessment-01',
    category: 'assessment',
    title: { en: 'Assessment result ready', vi: 'Đã có kết quả đánh giá' },
    body: {
      en: 'Your Barbell Bench Press form score is available.',
      vi: 'Điểm kỹ thuật bài đẩy ngực với thanh đòn đã sẵn sàng.',
    },
    createdAt: '2026-09-21T09:30:00.000Z',
    read: false,
    target: '/app/profile/assessments/assessment-demo-bench-01',
  },
  {
    id: 'notification-workout-01',
    category: 'workout',
    title: { en: 'Workout scheduled tomorrow', vi: 'Có lịch tập vào ngày mai' },
    body: {
      en: 'Upper Strength starts at 18:30.',
      vi: 'Buổi Upper Strength bắt đầu lúc 18:30.',
    },
    createdAt: '2026-09-20T13:00:00.000Z',
    read: true,
    target: '/app/workout/schedule',
  },
  {
    id: 'notification-marketplace-01',
    category: 'marketplace',
    title: { en: 'Gym service pending confirmation', vi: 'Dịch vụ Gym đang chờ xác nhận' },
    body: {
      en: 'Fit District is reviewing your purchased offer.',
      vi: 'Fit District đang xác nhận ưu đãi bạn đã mua.',
    },
    createdAt: '2026-09-18T05:45:00.000Z',
    read: true,
    target: '/app/marketplace',
  },
];

export const useMemberProfileStore = create<MemberProfileState>()(
  persist(
    (set) => ({
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
      notifications: initialNotifications,
      updateContact: (contact) => set({ contact }),
      updateSecurity: (security) =>
        set((state) => ({ security: { ...state.security, ...security } })),
      recordPasswordChange: () =>
        set((state) => ({
          security: { ...state.security, lastPasswordChangedAt: new Date().toISOString() },
        })),
      toggleWearable: (id) =>
        set((state) => ({
          wearables: state.wearables.map((device) =>
            device.id === id
              ? {
                  ...device,
                  connected: !device.connected,
                  lastSyncedAt: !device.connected ? new Date().toISOString() : null,
                }
              : device,
          ),
        })),
      syncWearable: (id) =>
        set((state) => ({
          wearables: state.wearables.map((device) =>
            device.id === id && device.connected
              ? { ...device, lastSyncedAt: new Date().toISOString() }
              : device,
          ),
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification,
          ),
        })),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),
    }),
    { name: 'fit:member-profile-center:v1', version: 1 },
  ),
);
