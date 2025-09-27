import { View, Text } from 'react-native';

export function BottomCTA() {
  return (
    <View className='px-4 pb-5 pt-3'>
      <View className='w-full rounded-2xl border border-emerald-100 px-4 py-3 items-center justify-center'>
        <Text className='text-emerald-600 font-semibold'>
          Select an address above to continue
        </Text>
      </View>
    </View>
  );
}
