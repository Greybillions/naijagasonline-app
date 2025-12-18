// app/join.tsx (or app/(stack)/join.tsx)

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { AppHeader } from '@/components/common/AppHeader';
import { router } from 'expo-router';
import { JoinRoles, NigerianCities } from '@/constants/locationData';

export default function JoinScreen() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [city, setCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('');
  const [sheetOptions, setSheetOptions] = useState<string[]>([]);
  const [onSelectOption, setOnSelectOption] = useState<(v: string) => void>(
    () => () => {}
  );

  const states = useMemo(() => Object.keys(NigerianCities), []);
  const citiesForState = useMemo(
    () => (stateVal ? (NigerianCities[stateVal] ?? []) : []),
    [stateVal]
  );

  const canSubmit = !!fullName.trim() && !!phone.trim() && !!role;

  function openSheet(
    title: string,
    options: string[],
    onSelect: (v: string) => void
  ) {
    setSheetTitle(title);
    setSheetOptions(options);
    setOnSelectOption(() => onSelect);
    setSheetOpen(true);
  }

  function onSubmitPress() {
    if (!canSubmit) return;
    setConfirmOpen(true);
  }

  async function doSubmit() {
    if (loading) return;
    setLoading(true);
    setConfirmOpen(false);

    try {
      const { error } = await supabase.from('join_requests').insert([
        {
          full_name: fullName.trim(),
          phone: phone.trim(),
          role: role.trim(),
          message: message.trim(),
          state: stateVal.trim(),
          city: city.trim(),
        },
      ]);
      if (error) throw error;

      setFullName('');
      setPhone('');
      setRole('');
      setMessage('');
      setStateVal('');
      setCity('');

      setSuccessOpen(true);
    } catch (e: any) {
      alert(e?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className='flex-1 bg-neutral-50' edges={['top']}>
      <AppHeader title='Join Us' onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior='automatic'
        >
          {/* Banner */}
          <View className='mt-4 bg-primary-700 rounded-3xl px-5 py-5'>
            <Text className='text-white text-lg font-extrabold'>
              Join Our Network
            </Text>
            <Text className='text-primary-100 mt-1'>
              Partner with certified vendors and service experts.
            </Text>
          </View>

          {/* Form */}
          <View className='mt-6 bg-white rounded-3xl border border-neutral-100 p-5'>
            <Text className='text-neutral-900 font-extrabold mb-4'>
              Fill in your details
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

            <Field label='Role'>
              <Pressable
                onPress={() =>
                  openSheet('Select Role', JoinRoles, (v) => setRole(v))
                }
                className='flex-row items-center justify-between py-3'
              >
                <Text
                  className={role ? 'text-neutral-900' : 'text-neutral-400'}
                >
                  {role || 'Select Role'}
                </Text>
                <Ionicons name='chevron-down' size={18} color='#9CA3AF' />
              </Pressable>
            </Field>

            <Field label='State'>
              <Pressable
                onPress={() =>
                  openSheet(
                    'Select State',
                    states.map((s) => s.toUpperCase()),
                    (v) => {
                      setStateVal(v.toLowerCase());
                      setCity('');
                    }
                  )
                }
                className='flex-row items-center justify-between py-3'
              >
                <Text
                  className={stateVal ? 'text-neutral-900' : 'text-neutral-400'}
                >
                  {stateVal ? stateVal.toUpperCase() : 'Select State'}
                </Text>
                <Ionicons name='chevron-down' size={18} color='#9CA3AF' />
              </Pressable>
            </Field>

            <Field label='City'>
              <Pressable
                disabled={!stateVal}
                onPress={() =>
                  openSheet('Select City', citiesForState, (v) => setCity(v))
                }
                className={`flex-row items-center justify-between py-3 ${
                  stateVal ? '' : 'opacity-60'
                }`}
              >
                <Text
                  className={city ? 'text-neutral-900' : 'text-neutral-400'}
                >
                  {stateVal ? city || 'Select City' : 'Choose a state first'}
                </Text>
                <Ionicons name='chevron-down' size={18} color='#9CA3AF' />
              </Pressable>
            </Field>

            <Field label='Message (Optional)'>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder='Tell us a bit about yourself…'
                placeholderTextColor='#9CA3AF'
                className='text-base min-h-[80px]'
                multiline
                scrollEnabled
                textAlignVertical='top'
                returnKeyType='done'
              />
            </Field>

            <Pressable
              onPress={onSubmitPress}
              disabled={!canSubmit || loading}
              className={`h-12 rounded-2xl mt-2 items-center justify-center ${
                !canSubmit || loading
                  ? 'bg-primary-300'
                  : 'bg-primary-700 active:bg-primary-800'
              }`}
            >
              <Text className='text-white font-extrabold text-base'>
                {loading ? 'Submitting…' : 'Submit'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- Select Sheet ---------- */}
      <SelectSheet
        open={sheetOpen}
        title={sheetTitle}
        options={sheetOptions}
        onClose={() => setSheetOpen(false)}
        onSelect={(v) => {
          onSelectOption(v);
          setSheetOpen(false);
        }}
      />

      {/* ---------- Confirm Modal ---------- */}
      <Modal visible={confirmOpen} transparent animationType='slide'>
        <TouchableWithoutFeedback onPress={() => setConfirmOpen(false)}>
          <View className='flex-1 bg-black/40' />
        </TouchableWithoutFeedback>

        <SafeAreaView
          edges={['bottom']}
          className='bg-white rounded-t-3xl px-6 pt-6 pb-6'
        >
          <Text className='text-lg font-extrabold text-center'>
            Confirm Request
          </Text>

          <View className='mt-4 rounded-2xl border border-primary-100 bg-primary-50 p-4'>
            <Row label='Name' value={fullName || '—'} />
            <Row label='Phone' value={phone || '—'} />
            <Row label='Role' value={role || '—'} />
            <Row
              label='State'
              value={stateVal ? stateVal.toUpperCase() : '—'}
            />
            <Row label='City' value={city || '—'} />
            {!!message && <Row label='Message' value={message} />}
          </View>

          <View className='mt-4 flex-row gap-3'>
            <Pressable
              onPress={() => setConfirmOpen(false)}
              className='flex-1 h-12 rounded-xl border items-center justify-center'
            >
              <Text>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={doSubmit}
              className='flex-1 h-12 rounded-xl bg-primary-700 items-center justify-center'
            >
              <Text className='text-white font-extrabold'>Confirm</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ---------- Success Modal ---------- */}
      <Modal visible={successOpen} transparent animationType='slide'>
        <TouchableWithoutFeedback onPress={() => setSuccessOpen(false)}>
          <View className='flex-1 bg-black/40' />
        </TouchableWithoutFeedback>

        <SafeAreaView
          edges={['bottom']}
          className='bg-white rounded-t-3xl px-6 pt-6 pb-6 items-center'
        >
          <Ionicons name='checkmark-circle' size={64} color='#020084' />
          <Text className='text-xl font-extrabold mt-2'>Request Sent</Text>
          <Text className='text-neutral-600 text-center mt-1'>
            We’ll reach out soon.
          </Text>

          <Pressable
            onPress={() => setSuccessOpen(false)}
            className='mt-5 w-full h-12 rounded-xl bg-primary-700 items-center justify-center'
          >
            <Text className='text-white font-extrabold'>Done</Text>
          </Pressable>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* ---------- Helpers ---------- */

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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className='flex-row justify-between py-1.5'>
      <Text className='text-neutral-600'>{label}</Text>
      <Text className='text-neutral-900 font-semibold text-right flex-1 ml-3'>
        {value}
      </Text>
    </View>
  );
}

function SelectSheet({
  open,
  title,
  options,
  onClose,
  onSelect,
}: {
  open: boolean;
  title: string;
  options: string[];
  onClose: () => void;
  onSelect: (v: string) => void;
}) {
  return (
    <Modal visible={open} transparent animationType='slide'>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className='flex-1 bg-black/40' />
      </TouchableWithoutFeedback>

      <SafeAreaView
        edges={['bottom']}
        className='bg-white rounded-t-3xl max-h-[70%]'
      >
        <Text className='text-center font-extrabold text-lg mt-3 mb-2'>
          {title}
        </Text>

        <ScrollView className='px-4 pb-6'>
          {options.map((opt) => (
            <Pressable
              key={opt}
              onPress={() => onSelect(opt)}
              className='py-3 px-3 mb-2 rounded-xl border'
            >
              <Text>{opt}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
