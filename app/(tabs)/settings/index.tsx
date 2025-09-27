import { Screen } from '@/components/common/Screen';
import { Pressable, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Settings() {
  return (
    <Screen title='Settings'>
      <Link href='/(tabs)/settings/addresses' asChild>
        <Pressable className='h-12 rounded-xl bg-neutral-100 px-4 justify-center'>
          <Text className='font-semibold text-neutral-800'>
            Manage Addresses →
          </Text>
        </Pressable>
      </Link>{' '}
    </Screen>
  );
}
