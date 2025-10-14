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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppHeader } from '@/components/common/AppHeader';
import { useCartStore } from '@/stores/cart.store';
import { useAddressesStore } from '@/stores/addresses.store';
import { addOrder, LocalOrder } from '@/lib/orders';
import { supabase } from '@/lib/supabase';

const NGN = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG')}`;
type PayMethod = 'cod' | 'card' | 'bank';

const LS_NAME_KEY = 'checkout_full_name';
const LS_PHONE_KEY = 'checkout_phone';

// small guards
const safeStr = (v: any) => (v == null ? '' : String(v));
const digitsOnly = (v: string) => v.replace(/\D+/g, '');

export default function CheckoutScreen() {
  const lines = useCartStore((s: any) => s.lines ?? s.items ?? []);
  // ✅ select the function, don't call it in the selector
  const clearCart = useCartStore((s: any) => s.clear);

  const subtotal = useMemo(() => {
    if (!Array.isArray(lines)) return 0;
    return lines.reduce(
      (acc: number, l: any) =>
        acc + (Number(l?.price) || 0) * (Number(l?.qty) || 0),
      0
    );
  }, [lines]);

  const deliveryFee = Array.isArray(lines) && lines.length ? 500 : 0;
  const total = subtotal + deliveryFee;

  const defaultAddress = useAddressesStore((s) => s.getDefault?.());
  const hasAddress = !!defaultAddress;

  const [method, setMethod] = useState<PayMethod>('cod'); // recommended
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // modals
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [savedName, savedPhone] = await Promise.all([
          AsyncStorage.getItem(LS_NAME_KEY),
          AsyncStorage.getItem(LS_PHONE_KEY),
        ]);
        if (savedName) setFullName(savedName);
        if (savedPhone) setPhone(savedPhone);
      } catch {}
    })();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem(LS_NAME_KEY, fullName).catch(() => {});
  }, [fullName]);
  useEffect(() => {
    AsyncStorage.setItem(LS_PHONE_KEY, phone).catch(() => {});
  }, [phone]);

  // safe address (no toFixed in render without guards)
  const deliveryAddressText = useMemo(() => {
    const details = safeStr(defaultAddress?.details).trim();
    const lat =
      typeof defaultAddress?.lat === 'number' && isFinite(defaultAddress.lat)
        ? defaultAddress.lat.toFixed(5)
        : '';
    const lng =
      typeof defaultAddress?.lng === 'number' && isFinite(defaultAddress.lng)
        ? defaultAddress.lng.toFixed(5)
        : '';
    const coords = lat && lng ? `${lat}, ${lng}` : '';
    return details || coords || '';
  }, [defaultAddress]);

  function onPlaceOrder() {
    // simple validation (errors can still use Alert for clarity)
    if (!fullName.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Phone required', 'Please enter your phone number.');
      return;
    }
    if (!hasAddress) {
      Alert.alert('No delivery address', 'Please select a delivery address.');
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
    setShowConfirm(false);

    const txRef = `NGO-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
    const nowIso = new Date().toISOString();

    const order: LocalOrder = {
      id: txRef,
      created_at: nowIso,
      name: safeStr(fullName).trim(),
      phonenumber: digitsOnly(safeStr(phone)),
      address: [safeStr(defaultAddress?.label), deliveryAddressText]
        .filter(Boolean)
        .join(' — '),
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
      sync: 'queued',
    };

    // local save
    try {
      await addOrder(order);
    } catch (e) {
      Alert.alert('Storage error', 'Could not save the order locally.');
      return;
    }

    // best-effort remote
    try {
      await supabase.from('cart_order').insert({
        name: order.name,
        phonenumber: order.phonenumber,
        address: order.address,
        product: order.product,
        tx_ref: order.tx_ref,
        delivery_method: order.delivery_method,
        payment_mode: order.payment_mode,
        status: order.status,
      });
    } catch (e) {
      console.warn('Order sync failed', e);
    }

    // clear cart
    try {
      clearCart?.();
    } catch {}

    setShowSuccess(true);
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

        {/* Delivery Address */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-2'>
            Delivery Address
          </Text>
          <View className='flex-row items-start justify-between'>
            <View className='flex-1 pr-3'>
              {hasAddress ? (
                <>
                  <Text className='text-neutral-900 font-semibold'>
                    {safeStr(defaultAddress?.label)}
                  </Text>
                  <Text className='text-neutral-700 mt-0.5'>
                    {deliveryAddressText || '—'}
                  </Text>
                </>
              ) : (
                <Text className='text-neutral-500'>
                  No default address selected.
                </Text>
              )}
              <Pressable onPress={() => router.push('/address')}>
                <Text className='text-primary-700 mt-1 font-semibold'>
                  {hasAddress ? 'Change' : 'Choose Address'}
                </Text>
              </Pressable>
            </View>
            <View className='w-14 h-14 rounded-xl bg-primary-50 items-center justify-center'>
              <Ionicons name='location-sharp' size={20} color='#020084' />
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className='bg-white rounded-2xl px-4 py-4 mb-3 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-3'>
            Payment Method
          </Text>

          <Pressable
            onPress={() => setMethod('cod')}
            className={`flex-row items-center justify-between h-12 px-3 rounded-xl border mb-2 ${
              method === 'cod'
                ? 'border-primary-300 bg-primary-50'
                : 'border-neutral-200'
            }`}
          >
            <View className='flex-row items-center'>
              <Ionicons name='bag-check-outline' size={18} color='#020084' />
              <Text className='ml-3 text-neutral-900'>
                Payment on Delivery
                <Text className='text-primary-700'> (Recommended)</Text>
              </Text>
            </View>
            <Ionicons
              name={method === 'cod' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={method === 'cod' ? '#020084' : '#9CA3AF'}
            />
          </Pressable>

          <Pressable
            onPress={() => {}}
            className='flex-row items-center justify-between h-12 px-3 rounded-xl border border-neutral-200 mb-2 opacity-70'
          >
            <View className='flex-row items-center'>
              <Ionicons name='card-outline' size={18} color='#111' />
              <Text className='ml-3 text-neutral-900'>Card — Coming soon</Text>
            </View>
            <Ionicons name='radio-button-off' size={20} color='#9CA3AF' />
          </Pressable>

          <Pressable
            onPress={() => {}}
            className='flex-row items-center justify-between h-12 px-3 rounded-xl border border-neutral-200 opacity-70'
          >
            <View className='flex-row items-center'>
              <Ionicons name='cash-outline' size={18} color='#111' />
              <Text className='ml-3 text-neutral-900'>
                Bank Transfer — Coming soon
              </Text>
            </View>
            <Ionicons name='radio-button-off' size={20} color='#9CA3AF' />
          </Pressable>
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
          className='h-12 rounded-xl items-center justify-center bg-primary-700 active:bg-primary-800'
        >
          <Text className='text-white font-extrabold'>Place Order</Text>
        </Pressable>
      </View>

      {/* Confirm Modal (slide from bottom) */}
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
          {/* catch taps inside sheet */}
          <RNPressable className='mt-auto'>
            <View className='w-full bg-white rounded-t-3xl p-5'>
              <View className='items-center mb-3'>
                <Ionicons name='alert-circle' size={28} color='#020084' />
              </View>
              <Text className='text-center text-lg font-extrabold text-neutral-900'>
                Confirm order
              </Text>

              <View className='mt-4 rounded-2xl border border-primary-100 bg-primary-50 p-4'>
                <Row label='Name' value={fullName || '—'} emphasize />
                <Row label='Phone' value={phone || '—'} />
                <Row
                  label='Address'
                  value={
                    hasAddress
                      ? `${safeStr(defaultAddress?.label)}${deliveryAddressText ? ` — ${deliveryAddressText}` : ''}`
                      : '—'
                  }
                />
                <Row
                  label='Payment'
                  value='Payment on Delivery (Recommended)'
                />
                <View className='h-px bg-neutral-200 my-3' />
                <Row label='Total' value={NGN(total)} bold />
              </View>

              <View className='mt-4 flex-row gap-3'>
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

      {/* Success Modal (slide from bottom) */}
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
              <View className='w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-3'>
                <Ionicons name='checkmark' size={36} color='#020084' />
              </View>
              <Text className='text-xl font-extrabold text-neutral-900'>
                Order placed!
              </Text>
              <Text className='text-neutral-600 text-center mt-2'>
                Thanks {fullName || 'there'} — we’ll deliver to{' '}
                {safeStr(defaultAddress?.label) || 'your address'} shortly.
              </Text>
              <View className='mt-5 w-full flex-row gap-3'>
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
  muted,
  bold,
  emphasize,
}: {
  label: string;
  value: string;
  muted?: boolean;
  bold?: boolean;
  emphasize?: boolean;
}) {
  return (
    <View className='flex-row items-start justify-between py-1.5'>
      <Text className='text-neutral-600 mr-3'>{label}</Text>
      <Text
        className={`flex-1 text-right ${
          bold ? 'font-extrabold text-neutral-900' : 'text-neutral-800'
        } ${muted ? 'text-red-500' : ''} ${emphasize ? 'text-primary-800 font-semibold' : ''}`}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}
