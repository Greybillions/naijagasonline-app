// app/(stack)/buy-gas.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppHeader } from '@/components/common/AppHeader';
import { supabase } from '@/lib/supabase';
import { NigerianCities } from '@/constants/locationData';
import { addOrder, LocalOrder } from '@/lib/orders';

/* ------------------------------ constants ------------------------------ */
type LabeledOption = { label: string; value: string };
type ListOption = string | LabeledOption;

const KG_OPTIONS = [
  '3kg',
  '5kg',
  '6kg',
  '10kg',
  '12.5kg',
  '25kg',
  '50kg',
] as const;
type KG = (typeof KG_OPTIONS)[number];

const PRICE_TABLE: Record<KG, number> = {
  '3kg': 3000,
  '5kg': 5000,
  '6kg': 6000,
  '10kg': 10000,
  '12.5kg': 12500,
  '25kg': 25000,
  '50kg': 50000,
} as const;

const DELIVERY_OPTIONS = ['Door Delivery', 'Pickup'] as const;
type Delivery = (typeof DELIVERY_OPTIONS)[number];

const NGN = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG')}`;
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* -------------------------------- screen ------------------------------- */
export default function BuyGasScreen() {
  // form
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [kg, setKg] = useState<KG | ''>('');
  const [delivery, setDelivery] = useState<Delivery | ''>('Door Delivery');
  const [stateVal, setStateVal] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  // sheets / modals
  const [sheetFor, setSheetFor] = useState<
    null | 'kg' | 'delivery' | 'state' | 'city'
  >(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [successOpen, setSuccessOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  // Sorted states for nicer UX
  const states = useMemo<readonly string[]>(
    () => Object.keys(NigerianCities).sort(),
    []
  );

  // Sorted cities for current state
  const citiesForState = useMemo<readonly string[]>(
    () => (stateVal ? (NigerianCities[stateVal] ?? []).slice().sort() : []),
    [stateVal]
  );

  const price = useMemo<number>(() => (kg ? PRICE_TABLE[kg] : 0), [kg]);

  const canSubmit: boolean =
    !!fullName.trim() &&
    !!phone.trim() &&
    !!kg &&
    !!delivery &&
    !!stateVal &&
    !!city &&
    !!address.trim();

  function onSubmitPress() {
    if (!canSubmit) return;
    setConfirmOpen(true);
  }

  async function doSubmit() {
    if (loading) return;
    setLoading(true);
    setConfirmOpen(false);

    // --- Build a local order (for Orders tab) ---
    const txRef = `NGO-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
    const nowIso = new Date().toISOString();

    const localOrder: LocalOrder = {
      id: txRef,
      created_at: nowIso,
      name: fullName.trim(),
      phonenumber: phone.trim(),
      address: [address.trim(), city, cap(stateVal)].filter(Boolean).join(', '),
      product: [
        {
          id: `kg-${kg || 'na'}`,
          title: 'Quick Refill',
          price,
          qty: 1,
        },
      ],
      tx_ref: txRef,
      delivery_method:
        delivery === 'Door Delivery' ? 'door_delivery' : 'pickup',
      payment_mode: 'cod',
      status: 'placed',
      total: price,
      sync: 'queued',
    };

    try {
      // 1) Save locally (source of truth for Orders page)
      await addOrder(localOrder);

      // 2) Fire-and-forget remote insert to Supabase
      await supabase.from('orders').insert([
        {
          full_name: localOrder.name,
          phone: localOrder.phonenumber,
          kg,
          price,
          status: 'pending',
          delivery_option: delivery,
          address: address.trim(),
          state: stateVal,
          city,
        },
      ]);

      // reset and show success
      setFullName('');
      setPhone('');
      setKg('');
      setDelivery('Door Delivery');
      setStateVal('');
      setCity('');
      setAddress('');
      setSuccessOpen(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unable to place order.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader title='Buy Gas Online' onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
      >
        <ScrollView
          className='flex-1'
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
        >
          {/* Banner */}
          <View className='mt-4 bg-[#7b0323] rounded-3xl px-5 py-5'>
            <Text className='text-white text-lg font-extrabold'>
              Quick Gas Refill
            </Text>
            <Text className='text-primary-100 mt-1'>
              Door delivery or pickup — safe, fast, reliable.
            </Text>
          </View>

          {/* Form */}
          <View className='mt-6 bg-white rounded-3xl border border-neutral-100 p-5'>
            <Text className='text-neutral-900 font-extrabold mb-4'>
              Order Details
            </Text>

            <Field label='Full Name'>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder='John Doe'
                className='text-base'
                placeholderTextColor='#9CA3AF'
              />
            </Field>

            <Field label='Phone'>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder='0803 123 4567'
                keyboardType='phone-pad'
                className='text-base'
                placeholderTextColor='#9CA3AF'
              />
            </Field>

            {/* KG */}
            <Select
              label='Cylinder Size (KG)'
              value={kg ?? ''}
              display={kg ? `${kg} — ${NGN(PRICE_TABLE[kg])}` : 'Select KG'}
              onPress={() => setSheetFor('kg')}
            />

            {/* Delivery */}
            <Select
              label='Delivery Option'
              value={delivery ?? ''}
              display={delivery || 'Select Delivery'}
              onPress={() => setSheetFor('delivery')}
            />

            {/* State */}
            <Select
              label='State'
              value={stateVal}
              display={stateVal ? cap(stateVal) : 'Select State'}
              onPress={() => setSheetFor('state')}
            />

            {/* City */}
            <Select
              label='City'
              value={city}
              display={
                city || (stateVal ? 'Select City' : 'Choose a state first')
              }
              disabled={!stateVal}
              onPress={() => stateVal && setSheetFor('city')}
            />

            <Field label='Delivery Address'>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder='House number, street, nearest landmark'
                className='text-base'
                placeholderTextColor='#9CA3AF'
                multiline
                numberOfLines={2}
                textAlignVertical='top'
              />
            </Field>

            {/* Price summary */}
            <View className='mt-1 rounded-xl bg-neutral-50 border border-neutral-200 p-4'>
              <Row label='Selected KG' value={(kg as string) || '—'} />
              <Row label='Delivery' value={delivery || '—'} />
              <View className='h-px bg-neutral-200 my-3' />
              <Row label='Total' value={NGN(price)} bold />
            </View>

            <Pressable
              onPress={onSubmitPress}
              disabled={!canSubmit || loading}
              className={`h-12 rounded-2xl mt-3 items-center justify-center ${
                !canSubmit || loading
                  ? 'bg-primary-300'
                  : 'bg-[#7b0323] active:bg-[#5a0019]'
              }`}
            >
              <Text className='text-white font-extrabold'>
                {loading ? 'Placing Order…' : 'Place Order'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Sheets */}
      <ListSheet
        open={sheetFor === 'kg'}
        title='Select KG'
        options={
          KG_OPTIONS.map<ListOption>((k) => ({
            label: `${k} — ${NGN(PRICE_TABLE[k])}`,
            value: k,
          })) as readonly ListOption[]
        }
        onClose={() => setSheetFor(null)}
        onSelect={(v) => {
          const chosen = typeof v === 'string' ? v : v.value;
          setKg(chosen as KG);
          setSheetFor(null);
        }}
      />

      <ListSheet
        open={sheetFor === 'delivery'}
        title='Select Delivery Option'
        options={DELIVERY_OPTIONS as readonly ListOption[]}
        onClose={() => setSheetFor(null)}
        onSelect={(v) => {
          const chosen = (typeof v === 'string' ? v : v.value) as Delivery;
          setDelivery(chosen);
          setSheetFor(null);
        }}
      />

      <ListSheet
        open={sheetFor === 'state'}
        title='Select State'
        options={
          states.map<ListOption>((s) => ({
            label: cap(s),
            value: s,
          })) as readonly ListOption[]
        }
        onClose={() => setSheetFor(null)}
        onSelect={(v) => {
          const chosen = (typeof v === 'string' ? v : v.value) as string;
          setStateVal(chosen);
          setCity('');
          setSheetFor(null);
        }}
      />

      <ListSheet
        open={sheetFor === 'city'}
        title={`Select City${stateVal ? ` (${cap(stateVal)})` : ''}`}
        options={citiesForState as readonly ListOption[]}
        onClose={() => setSheetFor(null)}
        onSelect={(v) => {
          const chosen = (typeof v === 'string' ? v : v.value) as string;
          setCity(chosen);
          setSheetFor(null);
        }}
      />

      {/* Confirm Modal (bottom anchored + scroll-safe) */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType='slide'
        onRequestClose={() => setConfirmOpen(false)}
      >
        <View className='flex-1 justify-end'>
          <TouchableWithoutFeedback onPress={() => setConfirmOpen(false)}>
            <View className='absolute inset-0 bg-black/40' />
          </TouchableWithoutFeedback>

          <View className='bg-white rounded-t-3xl px-6 pt-6 pb-5 max-h-[70%]'>
            <View className='items-center mb-3'>
              <View className='w-10 h-1.5 rounded-full bg-neutral-300' />
            </View>
            <Text className='text-lg font-extrabold text-neutral-900 text-center'>
              Confirm Order
            </Text>

            <ScrollView
              className='mt-4'
              keyboardShouldPersistTaps='handled'
              contentContainerStyle={{ paddingBottom: 10 }}
              showsVerticalScrollIndicator
            >
              <View className='rounded-2xl border border-primary-100 bg-primary-50 p-4'>
                <Row label='Name' value={fullName || '—'} />
                <Row label='Phone' value={phone || '—'} />
                <Row label='KG' value={(kg as string) || '—'} />
                <Row label='Delivery' value={delivery || '—'} />
                <Row label='State' value={cap(stateVal) || '—'} />
                <Row label='City' value={city || '—'} />
                <Row label='Address' value={address || '—'} />
                <View className='h-px bg-neutral-200 my-3' />
                <Row label='Total' value={NGN(price)} bold />
              </View>
            </ScrollView>

            <View className='mt-4 flex-row gap-3'>
              <Pressable
                onPress={() => setConfirmOpen(false)}
                className='flex-1 h-12 rounded-xl border border-neutral-200 items-center justify-center'
              >
                <Text className='text-neutral-800 font-semibold'>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={doSubmit}
                disabled={loading}
                className={`flex-1 h-12 rounded-xl items-center justify-center ${
                  loading ? 'bg-[#9b4a5d]' : 'bg-[#7b0323] active:bg-[#5a0019]'
                }`}
              >
                <Text className='text-white font-extrabold'>
                  {loading ? 'Submitting...' : 'Confirm'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal (bottom anchored) */}
      <Modal
        visible={successOpen}
        transparent
        animationType='slide'
        onRequestClose={() => setSuccessOpen(false)}
      >
        <View className='flex-1 justify-end'>
          <TouchableWithoutFeedback onPress={() => setSuccessOpen(false)}>
            <View className='absolute inset-0 bg-black/40' />
          </TouchableWithoutFeedback>

          <View className='bg-white rounded-t-3xl px-6 pt-6 pb-6 items-center'>
            <View className='w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-3'>
              <Ionicons name='checkmark' size={36} color='#7b0323' />
            </View>
            <Text className='text-xl font-extrabold text-neutral-900'>
              Order Placed
            </Text>
            <Text className='text-neutral-600 text-center mt-2'>
              We’ll contact you shortly to fulfill your refill request.
            </Text>

            <View className='mt-5 w-full flex-row gap-3'>
              <Pressable
                onPress={() => setSuccessOpen(false)}
                className='flex-1 h-12 rounded-xl border border-neutral-200 items-center justify-center'
              >
                <Text className='text-neutral-800 font-semibold'>Done</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setSuccessOpen(false);
                  router.replace('/(tabs)/orders');
                }}
                className='flex-1 h-12 rounded-xl bg-[#7b0323] active:bg-[#5a0019] items-center justify-center'
              >
                <Text className='text-white font-extrabold'>View Orders</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* --------------------------- tiny UI helpers --------------------------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className='mb-4'>
      <Text className='text-neutral-700 mb-1 font-medium'>{label}</Text>
      <View className='min-h-[48px] rounded-xl border border-neutral-200 bg-white px-3 justify-center'>
        {children}
      </View>
    </View>
  );
}

function Select({
  label,
  value,
  display,
  onPress,
  disabled,
}: {
  label: string;
  value: string;
  display: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View className='mb-4'>
      <Text className='text-neutral-700 mb-1 font-medium'>{label}</Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        className={`h-12 rounded-xl border px-3 flex-row items-center justify-between ${
          disabled
            ? 'border-neutral-200 bg-neutral-100'
            : 'border-neutral-200 bg-white'
        }`}
      >
        <Text className={value ? 'text-neutral-900' : 'text-neutral-400'}>
          {display}
        </Text>
        <Ionicons name='chevron-down' size={18} color='#9CA3AF' />
      </Pressable>
    </View>
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
    <View className='flex-row items-start justify-between py-1.5'>
      <Text className='text-neutral-600 mr-3'>{label}</Text>
      <Text
        className={`flex-1 text-right ${
          bold
            ? 'font-extrabold text-neutral-900'
            : 'text-neutral-900 font-semibold'
        }`}
        numberOfLines={3}
      >
        {value}
      </Text>
    </View>
  );
}

/* ----------------------------- List Sheet ------------------------------ */
function ListSheet({
  open,
  title,
  options,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  options: readonly ListOption[];
  onSelect: (v: ListOption) => void;
  onClose: () => void;
}) {
  // Normalize once for FlatList
  const data = useMemo(
    () =>
      options.map((opt) =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
      ),
    [options]
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: { label: string; value: string };
    index: number;
  }) => (
    <Pressable
      onPress={() => onSelect(item)}
      className='h-12 px-4 rounded-xl border border-neutral-200 bg-neutral-50 active:bg-neutral-100 mb-2 flex-row items-center justify-between'
    >
      <Text className='text-neutral-900'>{item.label}</Text>
      <Ionicons name='chevron-forward' size={18} color='#9CA3AF' />
    </Pressable>
  );

  return (
    <Modal
      transparent
      animationType='slide'
      visible={open}
      onRequestClose={onClose}
    >
      {/* Bottom anchored */}
      <View className='flex-1 justify-end'>
        {/* Absolute overlay so it doesn't push the sheet off-screen */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View className='absolute inset-0 bg-black/40' />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <View className='bg-white rounded-t-3xl px-6 pt-6 pb-4 max-h-[70%]'>
          {/* Handle */}
          <View className='items-center mb-3'>
            <View className='w-10 h-1.5 rounded-full bg-neutral-300' />
          </View>

          <Text className='text-lg font-extrabold text-neutral-900 mb-2'>
            {title}
          </Text>

          {/* FlatList for long lists */}
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item, i) => `${item.value}-${i}`}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{ paddingBottom: 10 }}
          />

          {/* Close Button */}
          <Pressable
            onPress={onClose}
            className='mt-2 h-12 rounded-xl border border-neutral-200 items-center justify-center'
          >
            <Text className='text-neutral-800 font-semibold'>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
