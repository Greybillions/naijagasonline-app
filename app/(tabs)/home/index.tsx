import { Screen } from '@/components/common/Screen';
import { useProductsStore } from '@/stores/products.store';
import { useCartStore } from '@/stores/cart.store';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  const products = useProductsStore((s) => s.products);
  const add = useCartStore((s) => s.add);

  return (
    <Screen title='NaijaGasOnline'>
      <View style={{ gap: 12 }}>
        {products.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => add({ productId: p.id, qty: 1 })}
          >
            <Text>
              ＋ {p.name} — ₦{p.price.toLocaleString('en-NG')}
            </Text>
          </Pressable>
        ))}
        <Link href='/(tabs)/cart' asChild>
          <Pressable>
            <Text style={{ marginTop: 16 }}>View Cart →</Text>
          </Pressable>
        </Link>
      </View>
    </Screen>
  );
}
