// app/(tabs)/cart.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/common/AppHeader';
import { useCartStore } from '@/stores/cart.store';

const NGN = (n: number) => `₦${n.toLocaleString('en-NG')}`;

// Absolute path to the checkout screen (lives at app/(stack)/cart/checkout.tsx)
const CHECKOUT_ROUTE = '../cart/checkout';

export default function CartScreen() {
  const { lines, inc, dec, setCoupon, coupon } = useCartStore();
  const [couponInput, setCouponInput] = useState('');

  const deliveryFee = 500;

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.price * l.qty, 0),
    [lines]
  );

  const discount = useMemo(() => {
    if (!coupon) return 0;
    return coupon.toUpperCase() === 'SAVE10' ? Math.round(subtotal * 0.1) : 0;
  }, [coupon, subtotal]);

  const total = Math.max(0, subtotal + deliveryFee - discount);

  function applyCoupon() {
    setCoupon(couponInput.trim() || null);
  }

  function checkout() {
    // Push to the stacked checkout screen (outside the tab bar)
    router.push(CHECKOUT_ROUTE);
  }

  const renderItem = ({ item }: { item: (typeof lines)[number] }) => (
    <View className='bg-white rounded-2xl px-3 py-3 mb-3 border border-neutral-100 flex-row items-center'>
      <View className='w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 mr-3'>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : null}
      </View>

      <View className='flex-1'>
        <Text className='font-semibold text-neutral-900' numberOfLines={1}>
          {item.title}
        </Text>
        <Text className='text-neutral-500 mt-0.5'>{NGN(item.price)}</Text>
      </View>

      <View className='flex-row items-center bg-neutral-100 rounded-full'>
        <Pressable
          className='w-9 h-9 items-center justify-center'
          onPress={() => dec(item.id)}
        >
          <Ionicons name='remove' size={18} color='#111' />
        </Pressable>
        <Text className='w-7 text-center font-semibold'>{item.qty}</Text>
        <Pressable
          className='w-9 h-9 items-center justify-center'
          onPress={() => inc(item.id)}
        >
          <Ionicons name='add' size={18} color='#111' />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader
        title='My Cart'
        subtitle={`${lines.length} item${lines.length !== 1 ? 's' : ''}`}
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
      >
        <FlatList
          data={lines}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 140,
          }}
          ListEmptyComponent={
            <View className='px-4 mt-10 items-center'>
              <Text className='text-neutral-500'>Your cart is empty.</Text>
            </View>
          }
          ListFooterComponent={
            lines.length > 0 ? (
              <View>
                {/* Coupon */}
                <View className='mt-2 bg-white rounded-2xl px-3 py-3 border border-neutral-100'>
                  <View className='flex-row items-center gap-3'>
                    <View className='flex-1 h-12 rounded-xl border border-neutral-200 bg-white px-3 justify-center'>
                      <TextInput
                        placeholder='Enter coupon code'
                        value={couponInput}
                        onChangeText={setCouponInput}
                        autoCapitalize='characters'
                        placeholderTextColor='#9CA3AF'
                      />
                    </View>
                    <Pressable
                      onPress={applyCoupon}
                      className='h-12 px-5 rounded-xl bg-[#7b0323] active:bg-primary-800 items-center justify-center'
                    >
                      <Text className='text-white font-semibold'>Apply</Text>
                    </Pressable>
                  </View>
                  {coupon !== null && (
                    <Text className='text-primary-700 text-xs mt-2'>
                      Applied: {coupon || '—'}
                    </Text>
                  )}
                </View>

                {/* Summary */}
                <View className='mt-3 bg-white rounded-2xl px-4 py-4 border border-neutral-100'>
                  <Text className='font-extrabold text-neutral-900 mb-3'>
                    Order Summary
                  </Text>
                  <Row label='Subtotal' value={NGN(subtotal)} />
                  <Row label='Delivery Fee' value={NGN(deliveryFee)} />
                  <Row
                    label='Discount'
                    value={discount ? `- ${NGN(discount)}` : '₦0'}
                    muted
                  />
                  <View className='h-px bg-neutral-200 my-3' />
                  <Row label='Total' value={NGN(total)} bold />
                </View>
              </View>
            ) : null
          }
        />

        {/* Sticky Checkout */}
        {lines.length > 0 && (
          <View className='absolute left-0 right-0 bottom-0 px-4 pb-5 pt-3 bg-neutral-50'>
            <Pressable
              onPress={checkout}
              className='h-12 rounded-xl bg-primary-700 active:bg-primary-800 items-center justify-center'
            >
              <Text className='text-white font-extrabold'>Checkout</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  muted,
  bold,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
}) {
  return (
    <View className='flex-row items-center justify-between py-2'>
      <Text
        className={`text-neutral-700 ${bold ? 'font-extrabold' : 'font-medium'}`}
      >
        {label}
      </Text>
      <Text
        className={`${bold ? 'font-extrabold text-neutral-900' : 'text-neutral-800'} ${
          muted ? 'text-red-500' : ''
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
