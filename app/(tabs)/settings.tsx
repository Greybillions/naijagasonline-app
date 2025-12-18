import {
  View,
  Text,
  Pressable,
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { useAddressesStore } from '@/stores/addresses.store';
import { AppHeader } from '@/components/common/AppHeader';

const APP_VERSION = '1.0.0';
const BUILD_NUMBER = '100';

export default function SettingsScreen() {
  // Load saved preferences

  async function clearLocalData() {
    Alert.alert(
      'Clear Local Data',
      'This will remove saved addresses and local app preferences from this device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              useAddressesStore.getState().clear?.();
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

  async function shareApp() {
    try {
      await Share.share({
        message:
          'Check out NaijaGasOnline - Get gas delivered to your doorstep! Download now: https://play.google.com/store/apps/details?id=com.naijagasonline.app',
        title: 'Share NaijaGasOnline',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  function checkForUpdates() {
    Alert.alert(
      'Check for Updates',
      'You are using the latest version of NaijaGasOnline.',
      [{ text: 'OK' }]
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-neutral-50' edges={['top']}>
      <AppHeader
        title='Settings'
        subtitle='Manage your preferences'
        onBack={() => router.back()}
      />

      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <Section title='SECURITY & PRIVACY'>
          <SettingRow
            icon='shield-checkmark-outline'
            tint='primary'
            title='Privacy Policy'
            subtitle='Read our privacy policy'
            onPress={() =>
              Linking.openURL('https://naijagasonline.app/privacy')
            }
          />
          <Divider />
          <SettingRow
            icon='document-text-outline'
            tint='primary'
            title='Terms of Service'
            subtitle='View terms and conditions'
            onPress={() => Linking.openURL('https://naijagasonline.app/terms')}
          />
        </Section>

        {/* App Preferences */}
        <Section title='APP PREFERENCES'>
          <SettingRow
            icon='cloud-outline'
            tint='primary'
            title='Data & Storage'
            subtitle='Manage app data usage'
            onPress={() => {
              Alert.alert(
                'Data & Storage',
                'Your app is using minimal storage. Clear local data from the settings below if needed.',
                [{ text: 'OK' }]
              );
            }}
          />
        </Section>

        {/* Support Section */}
        <Section title='SUPPORT & FEEDBACK'>
          <SettingRow
            icon='help-circle-outline'
            tint='primary'
            title='Help Center'
            subtitle='Get assistance and find answers'
            onPress={() => Linking.openURL('https://naijagasonline.help')}
          />
          <Divider />
          <SettingRow
            icon='chatbubble-outline'
            tint='primary'
            title='Contact Support'
            subtitle='Reach out to our team'
            onPress={() => Linking.openURL('mailto:support@naijagasonline.app')}
          />
          <Divider />
          <SettingRow
            icon='bug-outline'
            tint='primary'
            title='Report a Problem'
            subtitle='Let us know about issues'
            onPress={() =>
              Linking.openURL(
                'mailto:support@naijagasonline.app?subject=Bug Report'
              )
            }
          />
        </Section>

        {/* Share & More */}
        <Section title='SHARE & MORE'>
          <SettingRow
            icon='share-social-outline'
            tint='primary'
            title='Share App'
            subtitle='Tell friends about us'
            onPress={shareApp}
          />
          <Divider />
          <SettingRow
            icon='download-outline'
            tint='primary'
            title='Check for Updates'
            subtitle={`Version ${APP_VERSION} (${BUILD_NUMBER})`}
            onPress={checkForUpdates}
          />
        </Section>

        {/* Danger Zone */}
        <Section title='DANGER ZONE'>
          <SettingRow
            icon='trash-outline'
            tint='red'
            title='Clear Local Data'
            subtitle='Remove app data from this device'
            onPress={clearLocalData}
          />
        </Section>

        {/* App Info Footer */}
        <View className='items-center py-6 px-4'>
          <Text className='text-neutral-400 text-xs text-center'>
            NaijaGasOnline v{APP_VERSION} (Build {BUILD_NUMBER})
          </Text>
          <Text className='text-neutral-400 text-xs text-center mt-1'>
            {Platform.OS === 'ios' ? 'iOS' : 'Android'} • Made in Nigeria
          </Text>
          <Text className='text-neutral-400 text-xs text-center mt-1'>
            © 2024 NaijaGasOnline. All rights reserved.
          </Text>
        </View>
      </ScrollView>
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
    <View className='mt-4'>
      <Text className='text-[11px] font-semibold text-neutral-500 tracking-widest mb-2 px-1'>
        {title}
      </Text>
      <View className='bg-white rounded-2xl overflow-hidden'>{children}</View>
    </View>
  );
}

function Divider() {
  return <View className='h-px bg-neutral-100 ml-14' />;
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
    <Pressable
      android_ripple={{ color: '#E5E7EB' }}
      onPress={onPress}
      className='active:bg-neutral-50'
    >
      {content}
    </Pressable>
  ) : (
    <View>{content}</View>
  );
}
