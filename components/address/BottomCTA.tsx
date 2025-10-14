import { View, Text } from 'react-native';

export function BottomCTA() {
  return (
    <View className='px-4 pb-5 pt-3'>
      <View className='w-full rounded-2xl border border-primary-600 bg-primary-50 px-4 py-3 items-center justify-center'>
        <Text className='text-primary-700 font-semibold'>
          Select an address above to continue
        </Text>
      </View>
    </View>
  );
}
