// app/address/coverage.tsx
import React, { useMemo } from 'react';
import { View, Text, Pressable, Platform, ScrollView } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { useAddressesStore } from '@/stores/addresses.store';
import { HeaderBar } from '@/components/address/HeaderBar';

const NGN = (n: number) => `NGN ${n.toLocaleString('en-NG')}`;

export default function DeliveryCoverage() {
  const insets = useSafeAreaInsets();
  const def = useAddressesStore((s) => s.getDefault());
  const hasAddress = !!def;

  const etaText = '30–45 minutes';
  const deliveryFee = 500;
  const minOrder = 2000;

  const region: Region = useMemo(
    () =>
      def
        ? {
            latitude: def.lat,
            longitude: def.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        : {
            latitude: 6.5244, // Lagos fallback
            longitude: 3.3792,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          },
    [def]
  );

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      {/* Header */}
      <HeaderBar title='Delivery Coverage' onBack={() => router.back()} />

      {/* Main content scrolls */}
      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingBottom: 16 }}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        {/* Map */}
        <View
          className='mx-4 rounded-3xl overflow-hidden bg-neutral-200 border border-neutral-100'
          style={{ height: 200 }}
        >
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={{ flex: 1 }}
            region={region}
            scrollEnabled
            zoomEnabled
            showsUserLocation={false}
            showsMyLocationButton={false}
            mapType='standard'
          >
            {hasAddress && (
              <Marker
                coordinate={{ latitude: def!.lat, longitude: def!.lng }}
                title={def!.label}
                description={def!.details ?? undefined}
                pinColor='#0C6B4A'
              />
            )}
          </MapView>

          {/* subtle top-right chip */}
          <View className='absolute right-3 top-3 px-3 py-1 rounded-full bg-white/90 border border-neutral-200'>
            <Text className='text-[12px] font-semibold text-neutral-700'>
              Service Area
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className='px-4 mt-4'>
          <Text className='text-base font-extrabold text-neutral-900 mb-3'>
            Delivery Details
          </Text>

          {/* Address card */}
          <View className='bg-white rounded-2xl px-4 py-3 mb-3 border border-neutral-100 flex-row items-start gap-3'>
            <View className='w-9 h-9 rounded-full bg-emerald-100 items-center justify-center mt-0.5'>
              <Ionicons name='location-sharp' size={18} color='#0C6B4A' />
            </View>
            <View className='flex-1'>
              <Text className='text-neutral-900 font-semibold'>
                Your Address
              </Text>
              {hasAddress ? (
                <>
                  <Text className='text-neutral-800 mt-0.5'>{def!.label}</Text>
                  <Text className='text-neutral-500 mt-0.5'>
                    {def!.details ??
                      `${def!.lat.toFixed(5)}, ${def!.lng.toFixed(5)}`}
                  </Text>
                </>
              ) : (
                <Text className='text-neutral-500'>
                  No default address. Choose one to see coverage.
                </Text>
              )}
            </View>
            <Pressable
              onPress={() => router.push('/address')}
              className='px-3 py-2 rounded-xl bg-neutral-100 border border-neutral-200'
            >
              <Text className='text-neutral-800 text-[12px] font-semibold'>
                Change
              </Text>
            </Pressable>
          </View>

          {/* Info row */}
          <View className='flex-row gap-3 mb-3'>
            <View className='flex-1 bg-white rounded-2xl px-4 py-3 border border-neutral-100 flex-row items-center gap-3'>
              <View className='w-9 h-9 rounded-full bg-emerald-100 items-center justify-center'>
                <Ionicons name='time-outline' size={18} color='#0C6B4A' />
              </View>
              <View>
                <Text className='text-neutral-900 font-semibold'>ETA</Text>
                <Text className='text-neutral-700'>{etaText}</Text>
              </View>
            </View>

            <View className='flex-1 bg-white rounded-2xl px-4 py-3 border border-neutral-100 flex-row items-center gap-3'>
              <View className='w-9 h-9 rounded-full bg-emerald-100 items-center justify-center'>
                <Ionicons name='cash-outline' size={18} color='#0C6B4A' />
              </View>
              <View>
                <Text className='text-neutral-900 font-semibold'>Fee</Text>
                <Text className='text-neutral-700'>{NGN(deliveryFee)}</Text>
              </View>
            </View>
          </View>

          {/* Min order */}
          <View className='bg-white rounded-2xl px-4 py-3 mb-2 border border-neutral-100 flex-row items-center gap-3'>
            <View className='w-9 h-9 rounded-full bg-emerald-100 items-center justify-center'>
              <Ionicons name='cart-outline' size={18} color='#0C6B4A' />
            </View>
            <View>
              <Text className='text-neutral-900 font-semibold'>
                Minimum Order
              </Text>
              <Text className='text-neutral-700'>{NGN(minOrder)}</Text>
            </View>
          </View>

          {/* Note */}
          <View className='mt-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100'>
            <Text className='text-[12px] text-amber-800'>
              Delivery times may vary depending on traffic and availability.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer CTA (not absolute; uses safe-area bottom) */}
      <View
        className='px-4 border-t border-neutral-200 bg-neutral-50'
        style={{ paddingBottom: insets.bottom + 12, paddingTop: 12 }}
      >
        <Pressable
          onPress={() => router.replace('/(tabs)/home')}
          disabled={!hasAddress}
          className={`h-12 rounded-xl items-center justify-center ${
            hasAddress ? 'bg-emerald-600' : 'bg-neutral-300'
          }`}
        >
          <Text
            className={`font-semibold ${hasAddress ? 'text-white' : 'text-neutral-600'}`}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
