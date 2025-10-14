// /lib/orders.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartLine = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
};

export type LocalOrder = {
  id: string; // client id
  created_at: string; // ISO
  name: string;
  phonenumber: string; // store as string for safety
  address: string;
  product: CartLine[]; // mirrors "product" json column
  tx_ref: string;
  delivery_method: string; // e.g. "door_delivery"
  payment_mode: 'cod' | 'card' | 'bank';
  status: string; // "pending" | "placed" | "delivered" | etc.
  total: number; // convenience for UI
  sync?: 'queued' | 'ok' | 'failed'; // optional client-only
};

const LS_ORDERS = 'local_orders_v1';

export async function loadOrders(): Promise<LocalOrder[]> {
  try {
    const raw = await AsyncStorage.getItem(LS_ORDERS);
    return raw ? (JSON.parse(raw) as LocalOrder[]) : [];
  } catch {
    return [];
  }
}

export async function saveOrders(list: LocalOrder[]) {
  await AsyncStorage.setItem(LS_ORDERS, JSON.stringify(list));
}

export async function addOrder(o: LocalOrder) {
  const list = await loadOrders();
  list.unshift(o); // newest first
  await saveOrders(list);
}
