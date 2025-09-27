import { Screen } from '@/components/common/Screen';
import { View, Text, Pressable } from 'react-native';
import { useCartStore } from '@/stores/cart.store';

const SLOTS = ['09-11', '11-13', '13-15', '15-17'] as const;

export default function Slot() {
  // Store a simple slot on cart for now
  const setSlot = (slot: string) => useCartStore.setState({ slot });

  return (
    <Screen title='Delivery Slot'>
      <View style={{ gap: 12 }}>
        {SLOTS.map((s) => (
          <Pressable key={s} onPress={() => setSlot(s)}>
            <Text>Choose {s}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
