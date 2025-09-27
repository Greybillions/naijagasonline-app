import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/common/Screen';
import { View, Text } from 'react-native';
import { useOrdersStore } from '@/stores/orders.store';

export default function OrderDetail() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const order = useOrdersStore((s) => s.orders.find((o) => o.id === orderId));

  if (!order)
    return (
      <Screen title='Order'>
        <Text>Not found.</Text>
      </Screen>
    );

  return (
    <Screen title={`Order #${order.id}`}>
      <View style={{ gap: 8 }}>
        <Text>Status: {order.status}</Text>
        <Text>Items: {order.items.length}</Text>
        <Text>Total: ₦{order.total.toLocaleString('en-NG')}</Text>
      </View>
    </Screen>
  );
}
