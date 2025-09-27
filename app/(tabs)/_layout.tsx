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
      <View className='flex-row items-stretch justify-between px-4 py-6'>
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

          // Icon renderer from options.tabBarIcon
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
                  className={`mt-1 text-xs ${isFocused ? 'text-emerald-700 font-semibold' : 'text-neutral-500'}`}
                >
                  {label}
                </Text>
                {/* Active pill */}
                <View
                  className={`h-1 w-6 rounded-full mt-2 ${isFocused ? 'bg-emerald-600' : 'bg-transparent'}`}
                />
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
      case 'home/index':
        return (
          <Ionicons
            name={focused ? 'home' : 'home-outline'}
            size={22}
            color={color}
          />
        );
      case 'cart/index':
        return (
          <Ionicons
            name={focused ? 'cart' : 'cart-outline'}
            size={22}
            color={color}
          />
        );
      case 'orders/index':
        return (
          <Ionicons
            name={focused ? 'receipt' : 'receipt-outline'}
            size={22}
            color={color}
          />
        );
      case 'settings/index':
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
      // Keyboard dismiss + safe styles
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true, // RN Navigation v6 option
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name='home/index'
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => iconFor('home/index', focused),
        }}
      />
      <Tabs.Screen
        name='cart/index'
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => iconFor('cart/index', focused),
        }}
      />
      <Tabs.Screen
        name='orders/index'
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused }) => iconFor('orders/index', focused),
        }}
      />
      <Tabs.Screen
        name='settings/index'
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => iconFor('settings/index', focused),
        }}
      />
    </Tabs>
  );
}
