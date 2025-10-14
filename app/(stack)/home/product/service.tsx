// app/(stack)/get-service.tsx  (adjust path to where you want it)
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppHeader } from '@/components/common/AppHeader';
import { supabase } from '@/lib/supabase';
import { NigerianCities } from '@/constants/locationData';
import { addOrder, LocalOrder } from '@/lib/orders';

/* ------------------------------ constants ------------------------------ */

type ListOption = string | { label: string; value: string };

const SERVICE_OPTIONS = [
  'New Cylinder Setup',
  'Burner/Regulator Fix',
  'Leak Inspection',
  'Hose Replacement',
  'Full Installation',
  'Maintenance Visit',
] as const;
type ServiceType = (typeof SERVICE_OPTIONS)[number];

const URGENCY_OPTIONS = [
  'Today',
  'Tomorrow',
  'Within 3 days',
  'Next week',
] as const;
type Urgency = (typeof URGENCY_OPTIONS)[number];

const NGN = (n: number) => `₦${Number(n || 0).toLocaleString('en-NG')}`;
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* -------------------------------- screen ------------------------------- */

export default function GetServiceScreen() {
  // form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [urgency, setUrgency] = useState<Urgency | ''>('Tomorrow');
  const [budget, setBudget] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // sheets / modals
  const [sheetFor, setSheetFor] = useState<
    null | 'service' | 'urgency' | 'state' | 'city'
  >(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const states = useMemo(() => Object.keys(NigerianCities), []);
  const citiesForState = useMemo(
    () => (stateVal ? (NigerianCities[stateVal] ?? []) : []),
    [stateVal]
  );

  const price = useMemo(() => {
    const n = Number(budget.replace(/[^\d]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }, [budget]);

  const canSubmit =
    !!fullName.trim() &&
    !!phone.trim() &&
    !!serviceType &&
    !!urgency &&
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

    const txRef = `NGO-SVC-${Date.now()}-${Math.floor(Math.random() * 1e5)}`;
    const nowIso = new Date().toISOString();

    // Build local order so it shows in Orders tab
    const localOrder: LocalOrder = {
      id: txRef,
      created_at: nowIso,
      name: fullName.trim(),
      phonenumber: phone.trim(),
      address: [address.trim(), city, cap(stateVal)].filter(Boolean).join(', '),
      product: [
        {
          id: `svc-${serviceType || 'na'}`,
          title: `Service: ${serviceType || 'Request'}`, // 👈 appears in Orders
          price,
          qty: 1,
        },
      ],
      tx_ref: txRef,
      delivery_method: 'service',
      payment_mode: 'cod',
      status: 'placed',
      total: price,
      sync: 'queued',
    };

    try {
      // 1) Save locally (source of truth)
      await addOrder(localOrder);

      // 2) Best-effort remote insert (adjust table/columns to your schema)
      try {
        await supabase.from('service_requests').insert([
          {
            full_name: localOrder.name,
            phone: localOrder.phonenumber,
            service_type: serviceType || null,
            urgency: urgency || null,
            budget: price || null,
            notes: notes.trim() || null,
            address: address.trim(),
            state: stateVal,
            city,
            tx_ref: txRef,
            status: 'pending',
          },
        ]);
      } catch (e) {
        console.warn('Remote insert failed (service_requests):', e);
      }

      // reset + success
      setFullName('');
      setPhone('');
      setServiceType('');
      setUrgency('Tomorrow');
      setBudget('');
      setStateVal('');
      setCity('');
      setAddress('');
      setNotes('');
      setSuccessOpen(true);
    } catch (e: any) {
      alert(e?.message || 'Unable to submit request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader title='Get a Service' onBack={() => router.back()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className='flex-1'
      >
        <ScrollView
          className='flex-1'
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <View className='mt-4 bg-primary-700 rounded-3xl px-5 py-5'>
            <Text className='text-white text-lg font-extrabold'>
              Need a hand?
            </Text>
            <Text className='text-primary-100 mt-1'>
              Certified technicians. Safe installation & quick fixes.
            </Text>
          </View>

          {/* Form */}
          <View className='mt-6 bg-white rounded-3xl border border-neutral-100 p-5'>
            <Text className='text-neutral-900 font-extrabold mb-4'>
              Request Details
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

            <Select
              label='Service Type'
              value={serviceType}
              display={serviceType || 'Select Service'}
              onPress={() => setSheetFor('service')}
            />

            <Select
              label='Urgency'
              value={urgency}
              display={urgency || 'Select Urgency'}
              onPress={() => setSheetFor('urgency')}
            />

            <Field label='Estimated Budget (Optional)'>
              <TextInput
                value={budget}
                onChangeText={setBudget}
                placeholder='e.g. 10000'
                keyboardType='number-pad'
                className='text-base'
                placeholderTextColor='#9CA3AF'
              />
            </Field>

            <Select
              label='State'
              value={stateVal}
              display={stateVal ? cap(stateVal) : 'Select State'}
              onPress={() => setSheetFor('state')}
            />

            <Select
              label='City'
              value={city}
              display={
                city || (stateVal ? 'Select City' : 'Choose a state first')
              }
              disabled={!stateVal}
              onPress={() => stateVal && setSheetFor('city')}
            />

            <Field label='Address'>
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

            <Field label='Notes (Optional)'>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder='Describe the issue or request…'
                className='text-base'
                placeholderTextColor='#9CA3AF'
                multiline
                numberOfLines={3}
                textAlignVertical='top'
              />
            </Field>

            {/* Summary */}
            <View className='mt-1 rounded-xl bg-neutral-50 border border-neutral-200 p-4'>
              <Row label='Service' value={serviceType || '—'} />
              <Row label='Urgency' value={urgency || '—'} />
              <Row
                label='Location'
                value={[city, cap(stateVal)].filter(Boolean).join(', ') || '—'}
              />
              <View className='h-px bg-neutral-200 my-3' />
              <Row label='Budget' value={price ? NGN(price) : '—'} bold />
            </View>

            <Pressable
              onPress={onSubmitPress}
              disabled={!canSubmit || loading}
              className={`h-12 rounded-2xl mt-3 items-center justify-center ${
                !canSubmit || loading
                  ? 'bg-primary-300'
                  : 'bg-primary-700 active:bg-primary-800'
              }`}
            >
              <Text className='text-white font-extrabold'>
                {loading ? 'Submitting…' : 'Submit Request'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Sheets */}
      <ListSheet
        open={sheetFor === 'service'}
        title='Select Service'
        options={SERVICE_OPTIONS}
        onClose={() => setSheetFor(null)}
        onSelect={(v) => {
          setServiceType(v as ServiceType);
          setSheetFor(null);
        }}
      />

      <ListSheet
        open={sheetFor === 'urgency'}
        title='Select Urgency'
        options={URGENCY_OPTIONS}
        onClose={() => setSheetFor(null)}
        onSelect={(v) => {
          setUrgency(v as Urgency);
          setSheetFor(null);
        }}
      />

      <ListSheet
        open={sheetFor === 'state'}
        title='Select State'
        options={
          states.map((s) => ({
            label: cap(s),
            value: s,
          })) as unknown as readonly ListOption[]
        }
        onClose={() => setSheetFor(null)}
        onSelect={(v) => {
          const val = typeof v === 'string' ? v : v.value;
          setStateVal(String(val));
          setCity('');
          setSheetFor(null);
        }}
      />

      <ListSheet
        open={sheetFor === 'city'}
        title={`Select City${stateVal ? ` (${cap(stateVal)})` : ''}`}
        options={citiesForState}
        onClose={() => setSheetFor(null)}
        onSelect={(v) => {
          setCity(String(v));
          setSheetFor(null);
        }}
      />

      {/* Confirm Modal */}
      <Modal
        visible={confirmOpen}
        transparent
        animationType='slide'
        onRequestClose={() => setConfirmOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setConfirmOpen(false)}>
          <View className='flex-1 bg-black/40' />
        </TouchableWithoutFeedback>

        <View className='bg-white rounded-t-3xl px-6 pt-6 pb-5'>
          <View className='items-center mb-3'>
            <View className='w-10 h-1.5 rounded-full bg-neutral-300' />
          </View>
          <Text className='text-lg font-extrabold text-neutral-900 text-center'>
            Confirm Request
          </Text>

          <View className='mt-4 rounded-2xl border border-primary-100 bg-primary-50 p-4'>
            <Row label='Name' value={fullName || '—'} />
            <Row label='Phone' value={phone || '—'} />
            <Row label='Service' value={serviceType || '—'} />
            <Row label='Urgency' value={urgency || '—'} />
            <Row label='State' value={cap(stateVal) || '—'} />
            <Row label='City' value={city || '—'} />
            <Row label='Address' value={address || '—'} />
            {!!notes?.trim() && <Row label='Notes' value={notes} />}
            <View className='h-px bg-neutral-200 my-3' />
            <Row label='Budget' value={price ? NGN(price) : '—'} bold />
          </View>

          <View className='mt-4 flex-row gap-3'>
            <Pressable
              onPress={() => setConfirmOpen(false)}
              className='flex-1 h-12 rounded-xl border border-neutral-200 items-center justify-center'
            >
              <Text className='text-neutral-800 font-semibold'>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={doSubmit}
              className='flex-1 h-12 rounded-xl bg-primary-700 active:bg-primary-800 items-center justify-center'
            >
              <Text className='text-white font-extrabold'>Confirm</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={successOpen}
        transparent
        animationType='slide'
        onRequestClose={() => setSuccessOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSuccessOpen(false)}>
          <View className='flex-1 bg-black/40' />
        </TouchableWithoutFeedback>

        <View className='bg-white rounded-t-3xl px-6 pt-6 pb-6 items-center'>
          <View className='w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-3'>
            <Ionicons name='checkmark' size={36} color='#020084' />
          </View>
          <Text className='text-xl font-extrabold text-neutral-900'>
            Request Submitted
          </Text>
          <Text className='text-neutral-600 text-center mt-2'>
            We’ll reach out shortly to schedule your service.
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
              className='flex-1 h-12 rounded-xl bg-primary-700 active:bg-primary-800 items-center justify-center'
            >
              <Text className='text-white font-extrabold'>View Orders</Text>
            </Pressable>
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
  value: string | undefined;
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
  return (
    <Modal
      transparent
      animationType='slide'
      visible={open}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className='flex-1 bg-black/40' />
      </TouchableWithoutFeedback>

      <View className='bg-white rounded-t-3xl px-6 pt-6 pb-4'>
        <View className='items-center mb-3'>
          <View className='w-10 h-1.5 rounded-full bg-neutral-300' />
        </View>
        <Text className='text-lg font-extrabold text-neutral-900 mb-2'>
          {title}
        </Text>

        {options.map((opt, i) => {
          const label = typeof opt === 'string' ? opt : opt.label;
          return (
            <Pressable
              key={`${label}-${i}`}
              onPress={() => onSelect(opt)}
              className='h-12 px-4 rounded-xl border border-neutral-200 bg-neutral-50 active:bg-neutral-100 mb-2 flex-row items-center justify-between'
            >
              <Text className='text-neutral-900'>{label}</Text>
              <Ionicons name='chevron-forward' size={18} color='#9CA3AF' />
            </Pressable>
          );
        })}

        <Pressable
          onPress={onClose}
          className='mt-2 h-12 rounded-xl border border-neutral-200 items-center justify-center'
        >
          <Text className='text-neutral-800 font-semibold'>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}
