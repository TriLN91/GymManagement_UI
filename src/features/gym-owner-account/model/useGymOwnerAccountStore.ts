import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GymOwnerAccountState {
  readNotificationIds: ReadonlyArray<string>;
  markNotificationRead: (id: string) => void;
}

export const useGymOwnerAccountStore = create<GymOwnerAccountState>()(
  persist(
    (set) => ({
      readNotificationIds: [],
      markNotificationRead: (id) =>
        set((state) => ({
          readNotificationIds: state.readNotificationIds.includes(id)
            ? state.readNotificationIds
            : [...state.readNotificationIds, id],
        })),
    }),
    {
      name: 'gmc.gymOwnerAccountCenter',
      version: 1,
    },
  ),
);
