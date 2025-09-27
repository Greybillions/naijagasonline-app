import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { rnStorage } from './storage';

type CartItem = {
  productId: string;
  qty: number /* mode/size/addOns optional */;
};

type S = {
  items: CartItem[];
  slot?: string; // simple slot; or replace with DeliverySlot
  paymentReceiptUri?: string;
  add: (it: CartItem) => void;
  clear: () => void;
  setSlot: (slot?: string) => void;
  setReceipt: (uri?: string) => void;
};

export const useCartStore = create<S>()(
  persist(
    (set, get) => ({
      items: [],
      slot: undefined,
      paymentReceiptUri: undefined,

      add: (it) => set({ items: [...get().items, it] }),
      clear: () =>
        set({ items: [], slot: undefined, paymentReceiptUri: undefined }),
      setSlot: (slot) => set({ slot }),
      setReceipt: (uri) => set({ paymentReceiptUri: uri }),
    }),
    {
      name: 'ngo.cart',
      storage: createJSONStorage(() => rnStorage),
      version: 1,
    }
  )
);
