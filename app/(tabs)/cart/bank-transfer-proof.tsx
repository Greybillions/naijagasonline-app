import { Screen } from '@/components/common/Screen';
import { View, Text, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useCartStore } from '@/stores/cart.store';

export default function BankTransfer() {
  const setReceipt = (uri: string) =>
    useCartStore.setState({ paymentReceiptUri: uri });

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!res.canceled) setReceipt(res.assets[0].uri);
  }

  return (
    <Screen title='Bank Transfer'>
      <View style={{ gap: 12 }}>
        <Text>Upload transfer receipt</Text>
        <Pressable onPress={pick}>
          <Text>Pick image</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
