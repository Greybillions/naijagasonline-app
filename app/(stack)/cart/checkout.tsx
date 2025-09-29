// app/(tabs)/cart/checkout.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppHeader } from '@/components/common/AppHeader';
import { useCartStore } from '@/stores/cart.store';
import { useAddressesStore } from '@/stores/addresses.store';

const NGN = (n: number) => `₦${n.toLocaleString('en-NG')}`;
type PayMethod = 'card' | 'bank';

// Local storage keys
const LS_NAME_KEY = 'checkout_full_name';
const LS_PHONE_KEY = 'checkout_phone';

export default function CheckoutScreen() {
  // ---- Cart totals (adapt to your store shape if needed)
  const lines = useCartStore((s: any) => s.lines ?? s.items ?? []);
  const subtotal = useMemo(
    () =>
      Array.isArray(lines)
        ? lines.reduce(
            (acc: number, l: any) => acc + (l.price ?? 0) * (l.qty ?? 0),
            0
          )
        : 0,
    [lines]
  );
  const deliveryFee = lines?.length ? 500 : 0;
  const total = subtotal + deliveryFee;

  // ---- Address: use default from store
  const defaultAddress = useAddressesStore((s) => s.getDefault?.());
  const hasAddress = !!defaultAddress;

  // ---- UI state
  const [method, setMethod] = useState<PayMethod>('card');

  // ---- Customer details (persisted)
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Load saved name/phone once
  useEffect(() => {
    (async () => {
      try {
        const [savedName, savedPhone] = await Promise.all([
          AsyncStorage.getItem(LS_NAME_KEY),
          AsyncStorage.getItem(LS_PHONE_KEY),
        ]);
        if (savedName) setFullName(savedName);
        if (savedPhone) setPhone(savedPhone);
      } catch {
        // ignore read errors
      }
    })();
  }, []);

  // Persist on change (simple; move to onBlur if you prefer fewer writes)
  useEffect(() => {
    AsyncStorage.setItem(LS_NAME_KEY, fullName).catch(() => {});
  }, [fullName]);

  useEffect(() => {
    AsyncStorage.setItem(LS_PHONE_KEY, phone).catch(() => {});
  }, [phone]);

  function onPlaceOrder() {
    // Basic validation
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Phone required', 'Please enter your phone number.');
      return;
    }
    if (!hasAddress) {
      Alert.alert(
        'No delivery address',
        'Please select a delivery address before placing your order.'
      );
      return;
    }

    if (method === 'card') {
      Alert.alert(
        'Coming soon',
        'Card payments are coming soon. Please choose Bank Transfer for now.'
      );
      return;
    }

    // Bank transfer selected: pass along contact + address data
    router.push({
      pathname: '/cart/bank-transfer-proof',
      params: {
        name: fullName,
        phone,
        addressLabel: defaultAddress?.label ?? '',
        addressDetails:
          defaultAddress?.details ??
          `${defaultAddress?.lat?.toFixed?.(5) ?? ''}, ${defaultAddress?.lng?.toFixed?.(5) ?? ''}`,
        lat: String(defaultAddress?.lat ?? ''),
        lng: String(defaultAddress?.lng ?? ''),
      },
    });
  }

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader title='Checkout' onBack={() => router.back()} />

      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Details (persisted) */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-3'>
            Contact Details
          </Text>

          {/* Name */}
          <View className='mb-3'>
            <Text className='text-neutral-700 mb-1'>Full Name</Text>
            <View className='h-12 rounded-xl border border-neutral-200 bg-white px-3 justify-center'>
              <TextInput
                placeholder='e.g. John Doe'
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor='#9CA3AF'
                autoCapitalize='words'
                autoCorrect={false}
                returnKeyType='next'
              />
            </View>
          </View>

          {/* Phone */}
          <View>
            <Text className='text-neutral-700 mb-1'>Phone Number</Text>
            <View className='h-12 rounded-xl border border-neutral-200 bg-white px-3 justify-center'>
              <TextInput
                placeholder='e.g. 0803 123 4567'
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor='#9CA3AF'
                keyboardType='phone-pad'
                returnKeyType='done'
              />
            </View>
            <Text className='text-xs text-neutral-500 mt-1'>
              We’ll call this number if we need to reach you about your order.
            </Text>
          </View>
        </View>

        {/* Delivery Address (from store) */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-2'>
            Delivery Address
          </Text>
          <View className='flex-row items-start justify-between'>
            <View className='flex-1 pr-3'>
              {hasAddress ? (
                <>
                  <Text className='text-neutral-900 font-semibold'>
                    {defaultAddress?.label}
                  </Text>
                  <Text className='text-neutral-700 mt-0.5'>
                    {defaultAddress?.details ??
                      `${defaultAddress?.lat?.toFixed?.(5) ?? ''}, ${defaultAddress?.lng?.toFixed?.(5) ?? ''}`}
                  </Text>
                </>
              ) : (
                <Text className='text-neutral-500'>
                  No default address selected.
                </Text>
              )}
              <Pressable onPress={() => router.push('/address')}>
                <Text className='text-emerald-700 mt-1 font-semibold'>
                  {hasAddress ? 'Change' : 'Choose Address'}
                </Text>
              </Pressable>
            </View>
            <View className='w-14 h-14 rounded-xl bg-emerald-50 items-center justify-center'>
              <Ionicons name='location-sharp' size={20} color='#059669' />
            </View>
          </View>
        </View>

        {/* Delivery Window (placeholder for now) */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-2'>
            Delivery Window
          </Text>
          <View className='flex-row items-center justify-between'>
            <Text className='text-neutral-800'>Today, 10:00 AM – 12:00 PM</Text>
            <Pressable onPress={() => router.push('/address')}>
              <Text className='text-emerald-700 font-semibold'>Change</Text>
            </Pressable>
          </View>
        </View>

        {/* Payment Method */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-3'>
            Payment Method
          </Text>

          {/* Card */}
          <Pressable
            onPress={() => setMethod('card')}
            className='flex-row items-center justify-between h-12 px-3 rounded-xl border border-neutral-200 mb-2'
          >
            <View className='flex-row items-center'>
              <Ionicons name='card-outline' size={18} color='#111' />
              <Text className='ml-3 text-neutral-900'>Card</Text>
            </View>
            <Ionicons
              name={method === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={method === 'card' ? '#059669' : '#9CA3AF'}
            />
          </Pressable>

          {/* Bank Transfer */}
          <Pressable
            onPress={() => setMethod('bank')}
            className='flex-row items-center justify-between h-12 px-3 rounded-xl border border-neutral-200'
          >
            <View className='flex-row items-center'>
              <Ionicons name='cash-outline' size={18} color='#111' />
              <Text className='ml-3 text-neutral-900'>Bank Transfer</Text>
            </View>
            <Ionicons
              name={method === 'bank' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={method === 'bank' ? '#059669' : '#9CA3AF'}
            />
          </Pressable>

          {method === 'card' && (
            <Text className='text-amber-700 text-xs mt-2'>
              Card payments are coming soon.
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Footer total + CTA */}
      <View className='px-4 pb-5 pt-3 bg-neutral-50 border-t border-neutral-100'>
        <View className='flex-row items-center justify-between mb-3'>
          <Text className='text-neutral-600'>Total</Text>
          <Text className='text-neutral-900 font-extrabold'>{NGN(total)}</Text>
        </View>
        <Pressable
          onPress={onPlaceOrder}
          className={`h-12 rounded-xl items-center justify-center ${
            method === 'card' ? 'bg-neutral-300' : 'bg-emerald-700'
          }`}
        >
          <Text
            className={`font-extrabold ${
              method === 'card' ? 'text-neutral-700' : 'text-white'
            }`}
          >
            Place Order
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
