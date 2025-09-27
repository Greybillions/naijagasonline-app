import { Screen } from '@/components/common/Screen';
import { View, Text, TextInput } from 'react-native';

export default function ReportIssue() {
  return (
    <Screen title='Report Issue'>
      <View style={{ gap: 8 }}>
        <Text>Describe the issue</Text>
        <TextInput
          placeholder='Leak, damaged, delay…'
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 10,
            borderRadius: 8,
          }}
        />
      </View>
    </Screen>
  );
}
