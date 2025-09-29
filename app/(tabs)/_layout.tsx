// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Small, tidy custom tab bar
function TabBar({ state, descriptors, navigation }: any) {
  return (
    <SafeAreaView
      edges={['bottom']}
      className='bg-white border-t border-neutral-200'
    >
      <View className='flex-row items-stretch justify-between px-4 py-2'>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel ??
            options.title ??
            route.name.replace('/index', '');

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const Icon = options.tabBarIcon
            ? options.tabBarIcon({
                focused: isFocused,
                color: isFocused ? '#065F46' : '#6B7280',
                size: 22,
              })
            : null;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              android_ripple={{ color: '#E5E7EB', borderless: false }}
              className='flex-1 items-center justify-center'
            >
              <View className='items-center justify-center'>
                {Icon}
                <Text
                  className={`mt-1 text-xs ${
                    isFocused
                      ? 'text-emerald-700 font-semibold'
                      : 'text-neutral-500'
                  }`}
                >
                  {label}
                </Text>
                {/* underline/pill removed */}
              </View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  const iconFor = (name: string, focused: boolean) => {
    const color = focused ? '#065F46' : '#6B7280';
    switch (name) {
      case 'home':
        return (
          <Ionicons
            name={focused ? 'home' : 'home-outline'}
            size={22}
            color={color}
          />
        );
      case 'cart':
        return (
          <Ionicons
            name={focused ? 'cart' : 'cart-outline'}
            size={22}
            color={color}
          />
        );
      case 'orders':
        return (
          <Ionicons
            name={focused ? 'receipt' : 'receipt-outline'}
            size={22}
            color={color}
          />
        );
      case 'settings':
        return (
          <Ionicons
            name={focused ? 'settings' : 'settings-outline'}
            size={22}
            color={color}
          />
        );
      default:
        return <Ionicons name='ellipse-outline' size={22} color={color} />;
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name='home'
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => iconFor('home', focused),
        }}
      />
      <Tabs.Screen
        name='cart'
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => iconFor('cart', focused),
        }}
      />
      <Tabs.Screen
        name='orders'
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => iconFor('orders', focused),
        }}
      />
      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => iconFor('settings', focused),
        }}
      />
    </Tabs>
  );
}
