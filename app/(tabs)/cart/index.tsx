import { Screen } from '@/components/common/Screen';
import { View, Text, Pressable } from 'react-native';
import { useCartStore } from '@/stores/cart.store';
import { computeSubtotal } from '@/domain/calculators/totals';
import { Link } from 'expo-router';

export default function Cart() {
  const { items, add, clear } = useCartStore();
  const subtotal = computeSubtotal(items);
  const deliveryFee = items.length ? 800 : 0;
  const total = subtotal + deliveryFee;

  return (
    <Screen title='My Cart'>
      <View style={{ gap: 8 }}>
        <Pressable onPress={() => add({ productId: 'cyl-125', qty: 1 })}>
          <Text>Add 12.5kg</Text>
        </Pressable>

        {items.map((it, i) => (
          <Text key={i}>
            {it.productId} × {it.qty}
          </Text>
        ))}

        <Text style={{ marginTop: 8 }}>
          Subtotal: ₦{subtotal.toLocaleString('en-NG')}
        </Text>
        <Text>Delivery: ₦{deliveryFee.toLocaleString('en-NG')}</Text>
        <Text style={{ fontWeight: '600' }}>
          Total: ₦{total.toLocaleString('en-NG')}
        </Text>

        <Link href='/(tabs)/cart/checkout' asChild>
          <Pressable>
            <Text style={{ marginTop: 12 }}>Checkout →</Text>
          </Pressable>
        </Link>
        <Pressable onPress={clear}>
          <Text>Clear</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
