import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  const renderIcon = (label: string) => <Text>{label}</Text>;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name='home/index'
        options={{ title: 'Shop', tabBarIcon: () => renderIcon('🏠') }}
      />
      <Tabs.Screen
        name='cart/index'
        options={{ title: 'Cart', tabBarIcon: () => renderIcon('🛒') }}
      />
      <Tabs.Screen
        name='orders/index'
        options={{ title: 'Orders', tabBarIcon: () => renderIcon('🧾') }}
      />
      <Tabs.Screen
        name='settings/index'
        options={{ title: 'Settings', tabBarIcon: () => renderIcon('⚙️') }}
      />
    </Tabs>
  );
}
