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
  id: string; // local client-generated ID ("NGO-...")
  created_at: string; // ISO timestamp
  name: string;
  phonenumber: string; // keep as plain string
  address: string;
  product: CartLine[]; // list of purchased items
  tx_ref: string; // same as id or custom transaction ref
  delivery_method: string; // e.g. "door_delivery"
  payment_mode: 'cod' | 'card' | 'bank';
  status: string; // "placed" | "pending" | "delivered"
  total: number; // sum of items + delivery fee
  sync?: 'queued' | 'ok' | 'failed'; // optional: useful for offline sync later
};

// Storage key (easy versioning if you ever want to migrate structure)
const LS_ORDERS = 'local_orders_v1';

/**
 * Load all saved orders from device
 */
export async function loadOrders(): Promise<LocalOrder[]> {
  try {
    const raw = await AsyncStorage.getItem(LS_ORDERS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('loadOrders error:', err);
    return [];
  }
}

/**
 * Save full list of orders (overwrite)
 */
export async function saveOrders(list: LocalOrder[]) {
  try {
    await AsyncStorage.setItem(LS_ORDERS, JSON.stringify(list));
  } catch (err) {
    console.error('saveOrders error:', err);
  }
}

/**
 * Add a single order (prepend newest first)
 */
export async function addOrder(order: LocalOrder) {
  try {
    const list = await loadOrders();
    list.unshift(order);
    await saveOrders(list);
  } catch (err) {
    console.error('addOrder error:', err);
  }
}
