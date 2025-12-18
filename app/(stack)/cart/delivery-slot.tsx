import { Screen } from '@/components/common/Screen';
import { View, Text, Pressable } from 'react-native';
import { useCartStore } from '@/stores/cart.store';

const SLOTS = ['09-11', '11-13', '13-15', '15-17'] as const;

export default function Slot() {
  const setSlot = useCartStore((s) => s.setSlot);
  const activeSlot = useCartStore((s) => s.slot);

  return (
    <Screen title='Delivery Slot'>
      <View style={{ gap: 12 }}>
        {SLOTS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setSlot(s)}
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: activeSlot === s ? '#020084' : '#eee',
            }}
          >
            <Text style={{ color: activeSlot === s ? '#fff' : '#000' }}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}
