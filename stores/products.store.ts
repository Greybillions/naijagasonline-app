import { create } from 'zustand';
import { PRODUCTS } from '@/domain/sample-data';

export type Product = (typeof PRODUCTS)[number];
type S = { products: Product[]; getById: (id: string) => Product | undefined };

export const useProductsStore = create<S>(() => ({
  products: PRODUCTS as any,
  getById: (id) => (PRODUCTS as any).find((p: any) => p.id === id),
}));
