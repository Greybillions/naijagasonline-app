// app/(tabs)/cart/bank-transfer-proof.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { AppHeader } from '@/components/common/AppHeader';

export default function BankTransferProofScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Works across new/old expo-image-picker APIs
  const mediaTypeImages: any =
    (ImagePicker as any).MediaType?.Images ??
    (ImagePicker as any).MediaTypeOptions?.Images ??
    'images';

  async function pickReceipt() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission needed',
        'Allow photo library access to upload a receipt.'
      );
      return;
    }

    const options: any = {
      mediaTypes: mediaTypeImages,
      quality: 0.8,
      selectionLimit: 1, // new API
      allowsMultipleSelection: false, // old API
    };

    const res = await ImagePicker.launchImageLibraryAsync(options);
    if (!res.canceled) {
      setImageUri(res.assets?.[0]?.uri ?? null);
    }
  }

  async function copy(text: string) {
    try {
      await Clipboard.setStringAsync(text);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Copied to clipboard', ToastAndroid.SHORT);
      } else {
        Alert.alert('Copied', 'Account details copied to clipboard.');
      }
    } catch {
      Alert.alert('Copy failed', 'Unable to copy. Please try again.');
    }
  }

  async function submitPayment() {
    if (!imageUri) {
      Alert.alert(
        'Upload required',
        'Please upload your transfer receipt first.'
      );
      return;
    }
    try {
      setSubmitting(true);
      // TODO: upload imageUri to your backend/Supabase
      Alert.alert('Submitted', 'Your payment proof has been submitted.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)/orders') },
      ]);
    } catch (e: any) {
      Alert.alert('Submission failed', e?.message ?? 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const BANK = {
    name: 'Access Bank',
    accountName: 'NaijaGasOnline Ltd',
    accountNumber: '0123456789',
  };

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader title='Bank Transfer' onBack={() => router.back()} />

      <View className='px-4 pb-6'>
        {/* Account */}
        <View className='bg-white rounded-2xl p-4 mb-4 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-2'>
            Transfer to this Account
          </Text>
          <View className='rounded-xl border border-emerald-100 bg-emerald-50 p-3'>
            <Row label='Bank Name' value={BANK.name} />
            <Row label='Account Name' value={BANK.accountName} />
            <Row
              label='Account Number'
              value={BANK.accountNumber}
              copyable
              onCopy={() => copy(BANK.accountNumber)}
            />
          </View>

          {/* Quick copy all */}
          <Pressable
            onPress={() => copy(`${BANK.accountNumber}`)}
            className='mt-3 h-10 rounded-xl bg-neutral-100 border border-neutral-200 items-center justify-center'
          >
            <Text className='text-neutral-800 font-semibold'>
              Copy Account Number
            </Text>
          </Pressable>
        </View>

        {/* Upload */}
        <View className='bg-white rounded-2xl p-4 mb-4 border border-neutral-100'>
          <Text className='text-neutral-900 font-extrabold mb-3'>
            Upload Receipt
          </Text>

          <Pressable
            onPress={pickReceipt}
            className='rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50 px-4 py-4 flex-row items-center justify-between'
          >
            <View className='flex-row items-center'>
              <View className='w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3'>
                <Ionicons
                  name='cloud-upload-outline'
                  size={18}
                  color='#065F46'
                />
              </View>
              <View>
                <Text className='text-neutral-900 font-semibold'>
                  {imageUri ? 'Change receipt' : 'Upload Transfer Receipt'}
                </Text>
                <Text className='text-neutral-500 text-xs mt-1'>
                  PNG / JPG • max ~5MB
                </Text>
              </View>
            </View>
            <Ionicons name='chevron-forward' size={18} color='#111' />
          </Pressable>

          {imageUri && (
            <View className='mt-3 rounded-xl overflow-hidden border border-neutral-200'>
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: 180 }}
              />
            </View>
          )}

          <View className='mt-3 flex-row items-center'>
            <View className='w-2 h-2 rounded-full bg-amber-500 mr-2' />
            <Text className='text-amber-700 text-sm'>
              Awaiting Confirmation
            </Text>
          </View>
        </View>

        {/* Actions */}
        <Pressable
          onPress={submitPayment}
          disabled={submitting}
          className={`h-12 rounded-xl items-center justify-center ${
            submitting ? 'bg-emerald-600/70' : 'bg-emerald-600'
          }`}
        >
          <Text className='text-white font-extrabold'>
            {submitting ? 'Submitting...' : 'Submit Payment'}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/settings/help')}
          className='h-11 rounded-xl items-center justify-center mt-3 bg-neutral-100 border border-neutral-200'
        >
          <Text className='text-neutral-800 font-semibold'>Need Help?</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  copyable,
  onCopy,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  onCopy?: () => void;
}) {
  return (
    <View className='flex-row items-center justify-between py-2'>
      <Text className='text-neutral-600'>{label}</Text>
      <View className='flex-row items-center'>
        <Text className='text-neutral-900 font-semibold mr-2'>{value}</Text>
        {copyable ? (
          <Pressable onPress={onCopy} hitSlop={10}>
            <Ionicons name='copy-outline' size={16} color='#6B7280' />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
