// domain/types.ts

// ----- Catalog -----
export type SizeKG = 3 | 6 | 12.5;

export type AddOn = {
  id: string;
  name: string;
  price: number; // ₦
  image?: string; // local or remote URI
};

export type Product = {
  id: string;
  name: string;
  price: number; // base unit price (e.g., refill)
  images: string[];
  category?: 'cylinder' | 'accessory' | 'appliance';
  sizes?: SizeKG[]; // for cylinders
  specs?: {
    capacity?: string; // e.g., "12.5kg"
    material?: string; // e.g., "Steel"
    dimensions?: string; // e.g., "33×28×58cm"
  };
  addOns?: AddOn[];
};

// Refill vs new cylinder purchase
export type PurchaseMode = 'refill' | 'new';

// ----- Cart -----
export type CartItem = {
  productId: string;
  qty: number;
  mode?: PurchaseMode; // default 'refill' when cylinder
  size?: SizeKG; // if applicable
  addOnIds?: string[]; // selected add-ons
};

export type Cart = {
  items: CartItem[];
  slot?: DeliverySlot;
  couponCode?: string;
  paymentReceiptUri?: string; // bank transfer proof (local URI)
};

// ----- Addresses -----
export type Address = {
  id: string;
  label: string; // "Home", "Office", etc.
  lat: number;
  lng: number;
  details?: string; // landmarks / notes
  isDefault?: boolean;
};

export type Suggestion = {
  label: string;
  details?: string;
  lat: number;
  lng: number;
  placeId?: string;
};

// ----- Delivery -----
export type DeliveryWindow = '09-11' | '11-13' | '13-15' | '15-17';
export type DeliveryType = 'standard' | 'express';

export type DeliverySlot = {
  dateISO: string; // yyyy-mm-dd
  window: DeliveryWindow;
  type: DeliveryType;
  fee: number; // ₦
  areaCode?: string; // optional zoning key for pricing/ETAs
};

// ----- Payments -----
export type PaymentCard = { method: 'card'; last4?: string };
export type PaymentBankTransfer = {
  method: 'bank_transfer';
  receiptUri?: string; // image/PDF of transfer slip
  status?: 'pending' | 'verified' | 'rejected';
};
export type Payment = PaymentCard | PaymentBankTransfer;

// ----- Orders -----
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type OrderTotals = {
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
};

export type Order = {
  id: string;
  createdAt: number; // epoch ms
  items: CartItem[];
  addressId: string; // reference to saved address
  slot: DeliverySlot;
  payment: Payment;
  totals: OrderTotals;
  status: OrderStatus;
  otp?: string; // handoff verification
  receiptPdfUri?: string; // generated receipt
  issueTicketId?: string; // support ref if reported
};

// ----- App-level (promos, settings, notifications) -----
export type Promo = {
  code: string;
  title?: string;
  description?: string;
  validUntilISO?: string;
  discountType?: 'flat' | 'percent';
  amount?: number; // flat ₦ or percent
  active?: boolean;
};

export type Settings = {
  notificationsEnabled: boolean;
  refillReminderDays?: number; // e.g., 30
  appLock?: boolean; // optional passcode/biometric toggle
  privacyAccepted?: boolean;
};

// Convenience aggregate for backups/exports
export type BackupBlob = {
  version: number;
  cart?: Cart;
  addresses?: Address[];
  orders?: Order[];
  promos?: Promo[];
  settings?: Settings;
};
