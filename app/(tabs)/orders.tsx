// app/(tabs)/orders.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/common/AppHeader';
import { loadOrders } from '@/lib/orders';

const NGN = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG')}`;

export type LocalOrder = {
  id: string; // NGO-xxxx custom ID
  created_at: string; // ISO timestamp
  name: string;
  phonenumber: string;
  address: string;
  product: {
    id: string;
    title: string;
    price: number;
    qty: number;
    image?: string;
  }[];
  tx_ref: string;
  delivery_method: string;
  payment_mode: string;
  status: string;
  total: number;
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocalOrders = useCallback(async () => {
    try {
      const list = await loadOrders(); // <- pulls from AsyncStorage
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load local orders:', err);
      setOrders([]);
    }
  }, []);

  useEffect(() => {
    fetchLocalOrders();
  }, [fetchLocalOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocalOrders();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader title='My Orders' />

      <FlatList
        data={orders}
        keyExtractor={(o) => String(o.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View className='items-center mt-16 px-6'>
            <Ionicons name='cube-outline' size={28} color='#9CA3AF' />
            <Text className='text-neutral-500 mt-2 text-center'>
              No orders yet. When you place an order, it will appear here.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className='bg-white rounded-2xl p-4 mb-3 border border-neutral-100'>
            {/* Name + date */}
            <View className='flex-row items-center justify-between'>
              <Text
                className='font-extrabold text-neutral-900'
                numberOfLines={1}
              >
                {item.name || 'Customer'}
              </Text>
              <Text className='text-neutral-500 text-xs'>
                {new Date(item.created_at).toLocaleString()}
              </Text>
            </View>

            {/* Address */}
            <Text className='text-neutral-700 mt-1' numberOfLines={2}>
              {item.address || 'No address provided'}
            </Text>

            {/* Products */}
            <View className='mt-2'>
              <Text className='text-neutral-500 text-xs'>Items</Text>

              {(item.product || []).slice(0, 3).map((p, i) => (
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

            {/* Payment + Total */}
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

            {/* Ref + Status */}
            <View className='mt-2 flex-row items-center justify-between'>
              <Text className='text-neutral-500 text-xs'>
                Ref: {item.tx_ref}
              </Text>
              <Text className='text-primary-700 text-xs font-semibold'>
                {item.status || 'placed'}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
