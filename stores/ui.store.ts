import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { rnStorage } from './storage';

type S = {
  firstRun: boolean;
  tipsSeen: Record<string, boolean>;
  setFirstRun: (v: boolean) => void;
  markTip: (key: string) => void;
};

export const useUIStore = create<S>()(
  persist(
    (set, get) => ({
      firstRun: true,
      tipsSeen: {},
      setFirstRun: (v) => set({ firstRun: v }),
      markTip: (key) => set({ tipsSeen: { ...get().tipsSeen, [key]: true } }),
    }),
    { name: 'ngo.ui', storage: createJSONStorage(() => rnStorage), version: 1 }
  )
);
