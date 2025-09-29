import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const NGN = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Mocked receipt data – replace with API/store
  const items = [
    { name: '12.5kg Gas Refill', qty: 1, price: 12000 },
    { name: 'Gas Burner', qty: 1, price: 3500 },
  ];
  const delivery = 500;
  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const total = subtotal + delivery;

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      {/* Header */}
      <View className='px-4 pt-1 pb-3 bg-emerald-700 rounded-b-3xl'>
        <View className='flex-row items-center'>
          <Pressable
            onPress={() => router.back()}
            className='w-10 h-10 rounded-full bg-emerald-800 items-center justify-center'
          >
            <Ionicons name='chevron-back' size={20} color='#fff' />
          </Pressable>
          <Text className='flex-1 text-center text-white font-extrabold text-base'>
            Receipt #{id}
          </Text>
          <View className='w-10' />
        </View>
      </View>

      <ScrollView
        className='flex-1'
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className='bg-white rounded-2xl border border-neutral-100 p-4'>
          <Text className='font-extrabold text-neutral-900 mb-3'>
            Order Summary
          </Text>

          {items.map((it, i) => (
            <View
              key={i}
              className='flex-row items-center justify-between py-2'
            >
              <View className='flex-row items-center gap-2'>
                <Text className='font-medium text-neutral-900'>{it.name}</Text>
                <Text className='text-neutral-500'>×{it.qty}</Text>
              </View>
              <Text className='text-neutral-900'>{NGN(it.qty * it.price)}</Text>
            </View>
          ))}

          <View className='h-px bg-neutral-200 my-3' />

          <Row label='Subtotal' value={NGN(subtotal)} />
          <Row label='Delivery' value={NGN(delivery)} />

          <View className='h-px bg-neutral-200 my-3' />
          <Row label='Total' value={NGN(total)} bold />
        </View>

        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          className='mt-5 h-12 rounded-xl bg-emerald-700 items-center justify-center'
        >
          <Text className='text-white font-extrabold'>Back to Shop</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View className='flex-row items-center justify-between py-1'>
      <Text
        className={`${bold ? 'font-extrabold' : 'font-medium'} text-neutral-800`}
      >
        {label}
      </Text>
      <Text
        className={`${bold ? 'font-extrabold text-neutral-900' : 'text-neutral-900'}`}
      >
        {value}
      </Text>
    </View>
  );
}
