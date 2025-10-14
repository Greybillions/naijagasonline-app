import { Pressable, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPress: () => void;
  loading?: boolean;
};

export function CurrentLocationButton({ onPress, loading }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className='mb-3 h-12 rounded-2xl bg-primary-600 active:bg-primary-700 items-center justify-center flex-row'
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color='#fff' size='small' />
      ) : (
        <>
          <Ionicons
            name='navigate'
            size={18}
            color='#fff'
            style={{ marginRight: 8 }}
          />
          <Text className='text-white font-bold text-sm'>
            Use Current Location
          </Text>
        </>
      )}
    </Pressable>
  );
}
