import { Screen } from '@/components/common/Screen';
import { View, TextInput } from 'react-native';
export default function OTP() {
  return (
    <Screen title='Delivery OTP'>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <TextInput
            key={i}
            keyboardType='number-pad'
            maxLength={1}
            style={{
              width: 40,
              height: 48,
              borderWidth: 1,
              borderColor: '#ccc',
              textAlign: 'center',
              fontSize: 18,
            }}
          />
        ))}
      </View>
    </Screen>
  );
}
