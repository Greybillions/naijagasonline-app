import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid/non-secure';
import type { Address } from '@/domain/types';
import { rnStorage } from './storage';

type State = {
  addresses: Address[];
  getById: (id: string) => Address | undefined;
  getDefault: () => Address | undefined;
  add: (a: Omit<Address, 'id'>) => string;
  update: (id: string, patch: Partial<Omit<Address, 'id'>>) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
  clear: () => void;
};

export const useAddressesStore = create<State>()(
  persist(
    (set, get) => ({
      addresses: [],
      getById: (id) => get().addresses.find((a) => a.id === id),
      getDefault: () => get().addresses.find((a) => a.isDefault),

      add: (a) => {
        const id = nanoid(6);
        set((s) => {
          const next = [...s.addresses];
          if (a.isDefault) next.forEach((x) => (x.isDefault = false));
          else if (next.length === 0) a.isDefault = true;
          next.push({ ...a, id });
          return { addresses: next };
        });
        return id;
      },

      update: (id, patch) =>
        set((s) => {
          const next = s.addresses.map((x) =>
            x.id === id ? { ...x, ...patch } : x
          );
          if (patch.isDefault) next.forEach((x) => (x.isDefault = x.id === id));
          return { addresses: next };
        }),

      remove: (id) =>
        set((s) => {
          const removedWasDefault = s.addresses.find(
            (a) => a.id === id
          )?.isDefault;
          const next = s.addresses.filter((a) => a.id !== id);
          if (removedWasDefault && next.length) {
            next[0] = { ...next[0], isDefault: true };
            for (let i = 1; i < next.length; i++) next[i].isDefault = false;
          }
          return { addresses: next };
        }),

      setDefault: (id) =>
        set((s) => {
          if (!s.addresses.some((a) => a.id === id)) return s;
          const next = s.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));
          return { addresses: next };
        }),

      clear: () => set({ addresses: [] }),
    }),
    {
      name: 'ngo.addresses',
      storage: createJSONStorage(() => rnStorage), // <— AsyncStorage here
      version: 1,
    }
  )
);
