import { useProductsStore } from '@/stores/products.store';

export function computeSubtotal(items: { productId: string; qty: number }[]) {
  const get = useProductsStore.getState().getById;
  return items.reduce((sum, it) => {
    const p = get(it.productId);
    return sum + (p ? p.price * it.qty : 0);
  }, 0);
}
