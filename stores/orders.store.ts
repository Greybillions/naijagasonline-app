import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid/non-secure';
import { rnStorage } from './storage';

export type Order = {
  id: string;
  createdAt: number;
  items: { productId: string; qty: number }[];
  slot?: string;
  total: number;
  status:
    | 'placed'
    | 'confirmed'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  receiptUri?: string;
};

type S = {
  orders: Order[];
  place: (o: Omit<Order, 'id' | 'createdAt' | 'status'>) => string;
  updateStatus: (id: string, status: Order['status']) => void;
  clearAll: () => void;
};

export const useOrdersStore = create<S>()(
  persist(
    (set, get) => ({
      orders: [],
      place: (o) => {
        const id = nanoid(8);
        const order: Order = {
          id,
          createdAt: Date.now(),
          status: 'placed',
          ...o,
        };
        set({ orders: [order, ...get().orders] });
        return id;
      },
      updateStatus: (id, status) =>
        set({
          orders: get().orders.map((x) => (x.id === id ? { ...x, status } : x)),
        }),
      clearAll: () => set({ orders: [] }),
    }),
    {
      name: 'ngo.orders',
      storage: createJSONStorage(() => rnStorage),
      version: 1,
    }
  )
);
