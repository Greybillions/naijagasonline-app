// app/(tabs)/orders.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/common/AppHeader';
import { loadOrders, LocalOrder } from '@/lib/orders';

const NGN = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default function OrdersScreen() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocal = useCallback(async () => {
    const list = await loadOrders();
    setOrders(list);
  }, []);

  useEffect(() => {
    fetchLocal();
  }, [fetchLocal]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocal();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader title='My Orders' />
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className='items-center mt-16 px-6'>
            <Ionicons name='cube-outline' size={28} color='#9CA3AF' />
            <Text className='text-neutral-500 mt-2 text-center'>
              No orders yet. Place your first order to see it here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className='bg-white rounded-2xl p-4 mb-3 border border-neutral-100'>
            <View className='flex-row items-center justify-between'>
              <Text
                className='font-extrabold text-neutral-900'
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text className='text-neutral-500 text-xs'>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>

            <Text className='text-neutral-700 mt-1' numberOfLines={2}>
              {item.address}
            </Text>

            <View className='mt-2'>
              <Text className='text-neutral-500 text-xs'>Items</Text>
              {item.product.slice(0, 3).map((p, i) => (
                <Text
                  key={`${item.id}-${p.id}-${i}`}
                  className='text-neutral-800 text-xs'
                >
                  • {p.title} × {p.qty} — {NGN(p.price * p.qty)}
                </Text>
              ))}
              {item.product.length > 3 && (
                <Text className='text-neutral-400 text-xs'>
                  + {item.product.length - 3} more…
                </Text>
              )}
            </View>

            <View className='flex-row items-center justify-between mt-3'>
              <Text className='text-neutral-700'>
                Payment:{' '}
                {item.payment_mode === 'cod'
                  ? 'Payment on Delivery'
                  : item.payment_mode}
              </Text>
              <Text className='font-extrabold text-neutral-900'>
                {NGN(item.total)}
              </Text>
            </View>

            <View className='mt-2 flex-row items-center justify-between'>
              <Text className='text-neutral-500 text-xs'>
                Ref: {item.tx_ref}
              </Text>
              <Text className='text-primary-700 text-xs font-semibold'>
                {item.status}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
