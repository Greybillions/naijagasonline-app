import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { useAddressesStore } from '@/stores/addresses.store';
import { AppHeader } from '@/components/common/AppHeader';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  async function clearLocalData() {
    Alert.alert(
      'Clear Local Data',
      'This will remove saved addresses and local app preferences from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // If your store has a reset(), call it:
              useAddressesStore.getState().clear?.();
              // Otherwise, at least wipe AsyncStorage:
              await AsyncStorage.clear();
              Alert.alert('Done', 'All local data has been cleared.');
            } catch (e) {
              Alert.alert('Error', 'Unable to clear local data.');
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      {/* Header */}
      <AppHeader
        title='Settings'
        subtitle='Manage your account'
        onBack={() => router.back()}
      />

      {/* Content */}
      <View className='p-4 gap-4'>
        <Section title='ACCOUNT'>
          <SettingRow
            icon='location-outline'
            tint='primary'
            title='Addresses'
            subtitle='Manage delivery locations'
            onPress={() => router.push('/address')}
          />
        </Section>

        <Section title='APP SETTINGS'>
          <SettingRow
            icon='notifications-outline'
            tint='primary'
            title='Notifications & Reminders'
            subtitle='Order updates & gas reminders'
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                // brand colours for Switch (RN requires raw colours, not classes)
                thumbColor={notificationsEnabled ? '#020084' : undefined}
                trackColor={{ false: '#E5E7EB', true: '#a0a0ff' }} // ~primary-200
              />
            }
          />
          <SettingRow
            icon='cloud-outline'
            tint='primary'
            title='Local Backup & Restore'
            subtitle='Export or import your data'
            onPress={() =>
              Alert.alert('Coming soon', 'Backup tools are on the way!')
            }
          />
        </Section>

        <Section title='PRIVACY & DATA'>
          <SettingRow
            icon='trash-outline'
            tint='red'
            title='Clear Local Data'
            subtitle='Remove app data from this device'
            onPress={clearLocalData}
          />
        </Section>

        <Section title='SUPPORT'>
          <SettingRow
            icon='help-circle-outline'
            tint='primary'
            title='Help & Safety'
            subtitle='Get assistance and find answers'
            onPress={
              () => Linking.openURL('https://naijagasonline.help') // replace with your help URL
            }
          />
          <SettingRow
            icon='information-circle-outline'
            tint='primary'
            title='About'
            subtitle={`v1.0.0 • NaijaGasOnline • ${Platform.OS}`}
            onPress={() => Alert.alert('About', 'NaijaGasOnline v1.0.0')}
          />
        </Section>
      </View>
    </SafeAreaView>
  );
}

/* ---------- UI Pieces ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Text className='text-[11px] font-semibold text-neutral-500 tracking-widest mb-2'>
        {title}
      </Text>
      <View className='bg-white rounded-2xl border border-neutral-200 overflow-hidden'>
        {children}
      </View>
    </View>
  );
}

function SettingRow({
  icon,
  tint = 'primary',
  title,
  subtitle,
  right,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tint?: 'primary' | 'red';
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}) {
  const bg = tint === 'red' ? 'bg-red-100' : 'bg-primary-100';
  const color = tint === 'red' ? '#B91C1C' : '#020084';

  const content = (
    <View className='flex-row items-center p-4'>
      <View
        className={`w-9 h-9 rounded-full ${bg} items-center justify-center mr-3`}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>

      <View className='flex-1'>
        <Text
          className={`font-semibold ${
            tint === 'red' ? 'text-red-700' : 'text-neutral-900'
          }`}
          numberOfLines={1}
        >
          {title}
        </Text>
        {!!subtitle && (
          <Text
            className={`text-xs mt-0.5 ${
              tint === 'red' ? 'text-red-600' : 'text-neutral-500'
            }`}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {right ? (
        right
      ) : (
        <Ionicons name='chevron-forward' size={18} color='#9CA3AF' />
      )}
    </View>
  );

  return onPress ? (
    <Pressable android_ripple={{ color: '#E5E7EB' }} onPress={onPress}>
      {content}
    </Pressable>
  ) : (
    <View>{content}</View>
  );
}
