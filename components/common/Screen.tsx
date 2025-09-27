import { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({
  title,
  right,
  children,
}: {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{
          height: 56,
          borderBottomWidth: 1,
          borderColor: '#eee',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ fontWeight: '600', fontSize: 18 }}>{title}</Text>
        <View>{right}</View>
      </View>
      <View style={{ flex: 1, padding: 16 }}>{children}</View>
    </SafeAreaView>
  );
}
