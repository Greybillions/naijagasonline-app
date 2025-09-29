// app/(tabs)/orders/index.tsx
import React, { useMemo } from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { router } from 'expo-router';

type Order = {
  id: string;
  status: 'Delivered' | 'Processing' | 'Cancelled';
  total: number;
  date: string; // display string
  thumb: string; // image url
};

const NGN = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// Static gas-cylinder thumbs (Unsplash)
const GAS_IMGS = [
  'https://rqtzkqkdegwmnmkeyzjs.supabase.co/storage/v1/object/public/product-images/admin-products/product2.webp',
  'https://rqtzkqkdegwmnmkeyzjs.supabase.co/storage/v1/object/public/product-images/admin-products/product2.webp',
  'https://rqtzkqkdegwmnmkeyzjs.supabase.co/storage/v1/object/public/product-images/admin-products/product2.webp',
];

const ORDERS: Order[] = [
  {
    id: 'NGO-001234',
    status: 'Delivered',
    total: 14500,
    date: 'July 2, 2025',
    thumb: GAS_IMGS[0],
  },
  {
    id: 'NGO-001198',
    status: 'Processing',
    total: 26500,
    date: 'June 28, 2025',
    thumb: GAS_IMGS[1],
  },
  {
    id: 'NGO-001173',
    status: 'Cancelled',
    total: 9000,
    date: 'June 10, 2025',
    thumb: GAS_IMGS[2],
  },
];

export default function OrdersScreen() {
  const data = useMemo(() => ORDERS, []);

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader
        title='Orders'
        subtitle='Your recent orders'
        onBack={() => router.back()}
      />

      <FlatList
        data={data}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        renderItem={({ item }) => <OrderCard order={item} />}
        ItemSeparatorComponent={() => <View className='h-3' />}
        ListEmptyComponent={
          <View className='mt-10 items-center'>
            <Text className='text-neutral-500'>No past orders yet.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function StatusPill({ status }: { status: Order['status'] }) {
  const map = {
    Delivered: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    Processing: { bg: 'bg-amber-50', text: 'text-amber-700' },
    Cancelled: { bg: 'bg-red-50', text: 'text-red-700' },
  }[status] || { bg: 'bg-neutral-100', text: 'text-neutral-700' };

  return (
    <View className={`self-start px-2.5 py-1 rounded-full ${map.bg}`}>
      <Text className={`text-xs font-semibold ${map.text}`}>{status}</Text>
    </View>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <View className='bg-white rounded-2xl p-3 border border-neutral-100 flex-row'>
      {/* Left: details */}
      <View className='flex-1 mr-3'>
        <StatusPill status={order.status} />
        <Text
          className='mt-2 text-neutral-900 font-extrabold'
          numberOfLines={1}
        >
          Order #{order.id}
        </Text>
        <Text className='text-neutral-900 mt-1 font-semibold'>
          {NGN(order.total)}
        </Text>
        <Text className='text-neutral-500 mt-1 text-xs'>{order.date}</Text>
      </View>

      {/* Right: thumbnail */}
      <View className='w-[110px] h-[110px] rounded-2xl overflow-hidden bg-neutral-100'>
        <Image
          source={{ uri: order.thumb }}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
    </View>
  );
}
