import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { rnStorage } from './storage';

type S = {
  notificationsEnabled: boolean;
  refillReminderDays?: number;
  appLock?: boolean;
  privacyAccepted?: boolean;
  toggleNotifications: () => void;
  setRefillDays: (d?: number) => void;
  setPrivacyAccepted: (v: boolean) => void;
};

export const useSettingsStore = create<S>()(
  persist(
    (set, get) => ({
      notificationsEnabled: true,
      refillReminderDays: 30,
      appLock: false,
      privacyAccepted: false,

      toggleNotifications: () =>
        set({ notificationsEnabled: !get().notificationsEnabled }),
      setRefillDays: (d) => set({ refillReminderDays: d }),
      setPrivacyAccepted: (v) => set({ privacyAccepted: v }),
    }),
    {
      name: 'ngo.settings',
      storage: createJSONStorage(() => rnStorage),
      version: 1,
    }
  )
);
