import { Screen } from '@/components/common/Screen';
import { View, Text, Pressable } from 'react-native';
import { useCartStore } from '@/stores/cart.store';
import { computeSubtotal } from '@/domain/calculators/totals';
import { useOrdersStore } from '@/stores/orders.store';
import { router } from 'expo-router';

export default function Checkout() {
  const cart = useCartStore();
  const place = useOrdersStore((s) => s.place);

  const subtotal = computeSubtotal(cart.items);
  const delivery = cart.items.length ? 800 : 0;
  const total = subtotal + delivery;

  function onPlace() {
    const id = place({ items: cart.items, slot: cart.slot, total });
    cart.clear();
    router.replace(`/(tabs)/orders/${id}`);
  }

  return (
    <Screen title='Checkout'>
      <View style={{ gap: 10 }}>
        <Text>Slot: {cart.slot ?? '—'}</Text>
        <Text>Total: ₦{total.toLocaleString('en-NG')}</Text>
        <Pressable onPress={onPlace}>
          <Text>Place Order</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
