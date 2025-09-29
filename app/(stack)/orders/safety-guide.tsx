import { Screen } from '@/components/common/Screen';
import { View, Text } from 'react-native';

export default function SafetyGuide() {
  return (
    <Screen title='Safety Guide'>
      <View style={{ gap: 8 }}>
        <Text>• Check for leaks (soapy water test)</Text>
        <Text>• Keep cylinder upright and ventilated</Text>
        <Text>• Close valve after use</Text>
      </View>
    </Screen>
  );
}
