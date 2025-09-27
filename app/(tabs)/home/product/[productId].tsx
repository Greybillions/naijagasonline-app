import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/common/Screen';
import { Text } from 'react-native';

export default function ProductDetail() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  return (
    <Screen title='Product Details'>
      <Text>ID: {productId}</Text>
    </Screen>
  );
}
