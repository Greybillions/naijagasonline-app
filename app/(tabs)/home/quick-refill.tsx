import { Screen } from '@/components/common/Screen';
import { View, Text, Pressable } from 'react-native';
import { useCartStore } from '@/stores/cart.store';

export default function QuickRefill() {
  const add = useCartStore((s) => s.add);
  return (
    <Screen title='Quick Refill'>
      <View style={{ gap: 12 }}>
        <Text>Last order: 12.5kg refill</Text>
        <Pressable onPress={() => add({ productId: 'cyl-125', qty: 1 })}>
          <Text>Add 12.5kg to cart →</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
