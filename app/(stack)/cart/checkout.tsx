import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Pressable as RNPressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppHeader } from '@/components/common/AppHeader';
import { useCartStore } from '@/stores/cart.store';
import { supabase } from '@/lib/supabase';

const NGN = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG')}`;
type PayMethod = 'cod' | 'card' | 'bank';

const LS_NAME_KEY = 'checkout_full_name';
const LS_PHONE_KEY = 'checkout_phone';
const LS_ADDRESS_KEY = 'checkout_address';

// small guards
const safeStr = (v: any) => (v == null ? '' : String(v));
const digitsOnly = (v: string) => v.replace(/\D+/g, '');

export default function CheckoutScreen() {
  const lines = useCartStore((s: any) => s.lines ?? s.items ?? []);
  const clearCart = useCartStore((s: any) => s.clear);

  const subtotal = useMemo(() => {
    if (!Array.isArray(lines)) return 0;
    return lines.reduce(
      (acc: number, l: any) =>
        acc + (Number(l?.price) || 0) * (Number(l?.qty) || 0),
      0
    );
  }, [lines]);

  const deliveryFee = Array.isArray(lines) && lines.length ? 3000 : 0;
  const total = subtotal + deliveryFee;

  const [method, setMethod] = useState<PayMethod>('cod');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [savedName, savedPhone, savedAddress] = await Promise.all([
          AsyncStorage.getItem(LS_NAME_KEY),
          AsyncStorage.getItem(LS_PHONE_KEY),
          AsyncStorage.getItem(LS_ADDRESS_KEY),
        ]);
        if (savedName) setFullName(savedName);
        if (savedPhone) setPhone(savedPhone);
        if (savedAddress) setAddress(savedAddress);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(LS_NAME_KEY, fullName).catch(() => {});
  }, [fullName]);
  useEffect(() => {
    AsyncStorage.setItem(LS_PHONE_KEY, phone).catch(() => {});
  }, [phone]);
  useEffect(() => {
    AsyncStorage.setItem(LS_ADDRESS_KEY, address).catch(() => {});
  }, [address]);

  function onPlaceOrder() {
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Phone required', 'Please enter your phone number.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Address required', 'Please enter your delivery address.');
      return;
    }
    if (method !== 'cod') {
      Alert.alert(
        'Coming soon',
        'Card and Bank Transfer are coming soon. Use Payment on Delivery for now.'
      );
      return;
    }

    setShowConfirm(true);
  }

  async function confirmPlaceOrder() {
    try {
      setShowConfirm(false);
      setShowLoading(true);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 🔥 Local ID (string, safe)
      const localId = `ORD-${Date.now()}`;

      // 🔥 Supabase ID (numeric, bigint-safe)
      const supabaseId = Date.now();

      const nowIso = new Date().toISOString();
      const txRef = `NGO-${supabaseId}-${Math.floor(Math.random() * 1e5)}`;

      const cart_order = {
        id: supabaseId, // BIGINT for supabase
        created_at: nowIso,
        name: safeStr(fullName).trim(),
        phonenumber: digitsOnly(safeStr(phone)),
        address: safeStr(address).trim(),
        product: (Array.isArray(lines) ? lines : []).map((l: any) => ({
          id: safeStr(l?.id),
          title: safeStr(l?.title),
          price: Number(l?.price) || 0,
          qty: Number(l?.qty) || 0,
          image: l?.image ? safeStr(l.image) : undefined,
        })),
        tx_ref: txRef,
        delivery_method: 'door_delivery',
        payment_mode: 'cod',
        status: 'placed',
        total: Number(total) || 0,
      };

      // -----------------------------------------
      // SAVE TO SUPABASE
      // -----------------------------------------
      const { error } = await supabase.from('cart_order').insert(cart_order);

      if (error) {
        console.error('Supabase insert error:', error);
        Alert.alert(
          'Order Failed',
          'There was a problem placing your order. Please try again.'
        );
        setShowLoading(false);
        return;
      }

      // -----------------------------------------
      // SAVE LOCAL VERSION (must match orders.ts)
      // -----------------------------------------
      const localOrder = {
        ...cart_order,
        id: localId, // override with string id for local device
        sync: 'ok',
      };

      const existing = await AsyncStorage.getItem('local_orders_v1');
      const list = existing ? JSON.parse(existing) : [];

      list.unshift(localOrder);
      await AsyncStorage.setItem('local_orders_v1', JSON.stringify(list));

      // -----------------------------------------
      // CLEAR CART
      // -----------------------------------------
      try {
        clearCart?.();
      } catch {}

      setShowLoading(false);
      setShowSuccess(true);

      setTimeout(() => {
        router.replace('/(tabs)/orders');
      }, 1800);
    } catch (err) {
      console.error(err);
      setShowLoading(false);
      Alert.alert('Unexpected Error', 'Please try again.');
    }
  }

  function closeSuccessAndGoToOrders() {
    setShowSuccess(false);
    router.replace('/(tabs)/orders');
  }

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader title='Checkout' onBack={() => router.back()} />

      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Contact Details */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-3'>
            Contact Details
          </Text>

          <View className='mb-3'>
            <Text className='text-neutral-700 text-sm mb-1.5 font-medium'>
              Full Name
            </Text>
            <View className='h-12 rounded-xl border border-neutral-200 bg-white px-3 justify-center'>
              <TextInput
                placeholder='e.g. John Doe'
                value={fullName}
                onChangeText={setFullName}
                placeholderTextColor='#9CA3AF'
                autoCapitalize='words'
                autoCorrect={false}
                returnKeyType='next'
                className='text-neutral-900'
              />
            </View>
          </View>

          <View>
            <Text className='text-neutral-700 text-sm mb-1.5 font-medium'>
              Phone Number
            </Text>
            <View className='h-12 rounded-xl border border-neutral-200 bg-white px-3 justify-center'>
              <TextInput
                placeholder='e.g. 0803 123 4567'
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor='#9CA3AF'
                keyboardType='phone-pad'
                returnKeyType='next'
                className='text-neutral-900'
              />
            </View>
            <Text className='text-xs text-neutral-500 mt-1.5'>
              We&apos;ll call this number if we need to reach you.
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <View className='flex-row items-center justify-between mb-3'>
            <Text className='text-neutral-900 font-extrabold'>
              Delivery Address
            </Text>
            <View className='w-10 h-10 rounded-full bg-primary-50 items-center justify-center'>
              <Ionicons name='location-sharp' size={18} color='#020084' />
            </View>
          </View>

          <View>
            <Text className='text-neutral-700 text-sm mb-1.5 font-medium'>
              Street Address
            </Text>
            <View className='min-h-24 rounded-xl border border-neutral-200 bg-white px-3 py-3'>
              <TextInput
                placeholder='e.g. 123 Lekki Phase 1, Victoria Island, Lagos'
                value={address}
                onChangeText={setAddress}
                placeholderTextColor='#9CA3AF'
                autoCapitalize='sentences'
                multiline
                numberOfLines={3}
                textAlignVertical='top'
                returnKeyType='done'
                className='text-neutral-900'
                style={{ minHeight: 72 }}
              />
            </View>
            <Text className='text-xs text-neutral-500 mt-1.5'>
              Include landmarks or additional details to help us find you.
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-3'>
            Payment Method
          </Text>

          <Pressable
            onPress={() => setMethod('cod')}
            className={`flex-row items-center justify-between h-14 px-4 rounded-xl border mb-2 ${
              method === 'cod'
                ? 'border-primary-300 bg-primary-50'
                : 'border-neutral-200 bg-white'
            }`}
          >
            <View className='flex-row items-center flex-1'>
              <View className='w-10 h-10 rounded-full bg-primary-100 items-center justify-center mr-3'>
                <Ionicons name='bag-check-outline' size={20} color='#020084' />
              </View>
              <View className='flex-1'>
                <Text className='text-neutral-900 font-semibold'>
                  Payment on Delivery
                </Text>
                <Text className='text-xs text-primary-700 font-medium'>
                  Recommended
                </Text>
              </View>
            </View>
            <Ionicons
              name={method === 'cod' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={method === 'cod' ? '#020084' : '#9CA3AF'}
            />
          </Pressable>

          <Pressable
            onPress={() => {}}
            className='flex-row items-center justify-between h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50 mb-2 opacity-60'
          >
            <View className='flex-row items-center flex-1'>
              <View className='w-10 h-10 rounded-full bg-neutral-100 items-center justify-center mr-3'>
                <Ionicons name='card-outline' size={20} color='#6B7280' />
              </View>
              <View className='flex-1'>
                <Text className='text-neutral-700 font-semibold'>
                  Card Payment
                </Text>
                <Text className='text-xs text-neutral-500'>Coming soon</Text>
              </View>
            </View>
            <Ionicons name='radio-button-off' size={22} color='#D1D5DB' />
          </Pressable>

          <Pressable
            onPress={() => {}}
            className='flex-row items-center justify-between h-14 px-4 rounded-xl border border-neutral-200 bg-neutral-50 opacity-60'
          >
            <View className='flex-row items-center flex-1'>
              <View className='w-10 h-10 rounded-full bg-neutral-100 items-center justify-center mr-3'>
                <Ionicons name='cash-outline' size={20} color='#6B7280' />
              </View>
              <View className='flex-1'>
                <Text className='text-neutral-700 font-semibold'>
                  Bank Transfer
                </Text>
                <Text className='text-xs text-neutral-500'>Coming soon</Text>
              </View>
            </View>
            <Ionicons name='radio-button-off' size={22} color='#D1D5DB' />
          </Pressable>
        </View>

        {/* Order Summary */}
        <View className='bg-white rounded-2xl px-4 py-4 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-3'>
            Order Summary
          </Text>
          <View className='flex-row justify-between mb-2'>
            <Text className='text-neutral-600'>Subtotal</Text>
            <Text className='text-neutral-900 font-semibold'>
              {NGN(subtotal)}
            </Text>
          </View>
          <View className='flex-row justify-between mb-1'>
            <Text className='text-neutral-600'>Delivery Fee</Text>
            <Text className='text-neutral-900 font-semibold'>
              {NGN(deliveryFee)}
            </Text>
          </View>
          <Text className='text-red-400 text-xs mb-2'>
            Delivery fee may vary depending on your location.
          </Text>

          <View className='h-px bg-neutral-200 my-2' />
          <View className='flex-row justify-between'>
            <Text className='text-neutral-900 font-bold'>Total</Text>
            <Text className='text-primary-700 font-extrabold text-lg'>
              {NGN(total)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View className='px-4 pb-5 pt-3 bg-white border-t border-neutral-200'>
        <Pressable
          onPress={onPlaceOrder}
          className='h-14 rounded-xl items-center justify-center bg-primary-700 active:bg-primary-800'
        >
          <Text className='text-white font-extrabold text-base'>
            Place Order • {NGN(total)}
          </Text>
        </Pressable>
      </View>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirm}
        transparent
        animationType='slide'
        onRequestClose={() => setShowConfirm(false)}
      >
        <RNPressable
          className='flex-1 bg-black/40'
          onPress={() => setShowConfirm(false)}
        >
          <RNPressable className='mt-auto'>
            <View className='w-full bg-white rounded-t-3xl p-5'>
              <View className='items-center mb-4'>
                <View className='w-14 h-14 rounded-full bg-primary-100 items-center justify-center mb-2'>
                  <Ionicons name='alert-circle' size={28} color='#020084' />
                </View>
                <Text className='text-center text-xl font-extrabold text-neutral-900'>
                  Confirm Your Order
                </Text>
                <Text className='text-center text-neutral-600 mt-1'>
                  Please review your details before placing the order
                </Text>
              </View>

              <View className='rounded-2xl border border-primary-100 bg-primary-50 p-4 mb-4'>
                <Row label='Name' value={fullName || '—'} />
                <Row label='Phone' value={phone || '—'} />
                <Row label='Address' value={address || '—'} />
                <Row label='Payment' value='Payment on Delivery' />
                <View className='h-px bg-primary-200 my-3' />
                <Row label='Total' value={NGN(total)} bold />
              </View>

              <View className='flex-row gap-3'>
                <Pressable
                  onPress={() => setShowConfirm(false)}
                  className='flex-1 h-12 rounded-xl border border-neutral-200 items-center justify-center'
                >
                  <Text className='text-neutral-800 font-semibold'>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={confirmPlaceOrder}
                  className='flex-1 h-12 rounded-xl bg-primary-700 active:bg-primary-800 items-center justify-center'
                >
                  <Text className='text-white font-extrabold'>Confirm</Text>
                </Pressable>
              </View>
            </View>
          </RNPressable>
        </RNPressable>
      </Modal>

      {/* Loading Modal */}
      <Modal visible={showLoading} transparent animationType='fade'>
        <View className='flex-1 bg-black/50 items-center justify-center'>
          <View className='bg-white rounded-3xl p-8 items-center mx-8'>
            <ActivityIndicator size='large' color='#020084' />
            <Text className='text-neutral-900 font-bold text-lg mt-4'>
              Processing Order...
            </Text>
            <Text className='text-neutral-600 text-center mt-2'>
              Please wait while we confirm your order
            </Text>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType='slide'
        onRequestClose={() => setShowSuccess(false)}
      >
        <RNPressable
          className='flex-1 bg-black/40'
          onPress={closeSuccessAndGoToOrders}
        >
          <RNPressable className='mt-auto'>
            <View className='w-full bg-white rounded-t-3xl p-6 items-center'>
              <View className='w-20 h-20 rounded-full bg-emerald-100 items-center justify-center mb-4'>
                <Ionicons name='checkmark-circle' size={48} color='#10B981' />
              </View>
              <Text className='text-2xl font-extrabold text-neutral-900'>
                Order Placed!
              </Text>
              <Text className='text-neutral-600 text-center mt-2 mb-1'>
                Thanks {fullName || 'there'}!
              </Text>
              <Text className='text-neutral-500 text-center text-sm px-4'>
                Your order will be delivered to your address shortly.
              </Text>

              <View className='mt-6 w-full flex-row gap-3'>
                <Pressable
                  onPress={() => setShowSuccess(false)}
                  className='flex-1 h-12 rounded-xl border border-neutral-200 items-center justify-center'
                >
                  <Text className='text-neutral-800 font-semibold'>Done</Text>
                </Pressable>
                <Pressable
                  onPress={closeSuccessAndGoToOrders}
                  className='flex-1 h-12 rounded-xl bg-primary-700 active:bg-primary-800 items-center justify-center'
                >
                  <Text className='text-white font-extrabold'>View Orders</Text>
                </Pressable>
              </View>
            </View>
          </RNPressable>
        </RNPressable>
      </Modal>
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
    <View className='flex-row items-start justify-between py-2'>
      <Text className='text-neutral-600 text-sm'>{label}</Text>
      <Text
        className={`flex-1 text-right ml-3 ${
          bold
            ? 'font-extrabold text-primary-700 text-base'
            : 'text-neutral-800 font-medium'
        }`}
        numberOfLines={bold ? 1 : 3}
      >
        {value}
      </Text>
    </View>
  );
}
