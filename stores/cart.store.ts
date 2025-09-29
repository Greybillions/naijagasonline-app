// stores/cart.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Match your Supabase product shape
export type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  subtitle?: string;
  description?: string;
  rating?: number;
  kg?: string;
  phone?: string;
  state?: string;
  city?: string;
  seller_name?: string;
};

export type CartLine = {
  id: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  coupon: string | null;

  add: (p: Product, qty?: number) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;

  setCoupon: (code: string | null) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,

      add: (p, qty = 1) => {
        set((s) => {
          const idx = s.lines.findIndex((l) => l.id === p.id);
          if (idx === -1) {
            return {
              lines: [
                ...s.lines,
                {
                  id: p.id,
                  title: p.title,
                  price: p.price,
                  image: p.image,
                  qty: qty,
                },
              ],
            };
          }
          const copy = [...s.lines];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
          return { lines: copy };
        });
      },

      inc: (id) =>
        set((s) => {
          const idx = s.lines.findIndex((l) => l.id === id);
          if (idx === -1) return s;
          const copy = [...s.lines];
          copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
          return { lines: copy };
        }),

      dec: (id) =>
        set((s) => {
          const idx = s.lines.findIndex((l) => l.id === id);
          if (idx === -1) return s;
          const copy = [...s.lines];
          const next = copy[idx].qty - 1;
          if (next <= 0) {
            copy.splice(idx, 1);
          } else {
            copy[idx] = { ...copy[idx], qty: next };
          }
          return { lines: copy };
        }),

      setQty: (id, qty) =>
        set((s) => {
          const idx = s.lines.findIndex((l) => l.id === id);
          if (idx === -1) return s;
          const copy = [...s.lines];
          if (qty <= 0) copy.splice(idx, 1);
          else copy[idx] = { ...copy[idx], qty };
          return { lines: copy };
        }),

      remove: (id) =>
        set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),

      clear: () => set({ lines: [] }),

      setCoupon: (code) => set({ coupon: code }),
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lines: state.lines,
        coupon: state.coupon,
      }),
    }
  )
);
