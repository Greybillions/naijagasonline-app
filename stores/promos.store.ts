import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { rnStorage } from './storage';

type Promo = {
  code: string;
  active?: boolean;
  title?: string;
  description?: string;
};

type S = {
  promos: Promo[];
  activeCode?: string;
  add: (p: Promo) => void;
  activate: (code?: string) => void;
  clear: () => void;
};

export const usePromosStore = create<S>()(
  persist(
    (set, get) => ({
      promos: [],
      activeCode: undefined,
      add: (p) => set({ promos: [...get().promos, p] }),
      activate: (code) => set({ activeCode: code }),
      clear: () => set({ promos: [], activeCode: undefined }),
    }),
    {
      name: 'ngo.promos',
      storage: createJSONStorage(() => rnStorage),
      version: 1,
    }
  )
);
