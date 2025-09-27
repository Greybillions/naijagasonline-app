// components/address/HeaderBar.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  title?: string;
  showBack?: boolean; // default: true
  onBack?: () => void; // default: router.back()
  right?: React.ReactNode; // optional right-side action
  includeSafeTop?: boolean; // add top inset padding if this header sits at the very top
  bgClassName?: string; // override background (e.g. 'bg-neutral-50')
};

export function HeaderBar({
  title = 'Delivery Address',
  showBack = true,
  onBack,
  right,
  includeSafeTop = false,
  bgClassName = 'bg-transparent',
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`${bgClassName}`}
      style={{ paddingTop: includeSafeTop ? insets.top : 0 }}
    >
      <View className='px-4 py-3 flex-row items-center'>
        {/* Left: back button or spacer to keep title centered */}
        <View className='w-10 h-10 items-center justify-center'>
          {showBack ? (
            <Pressable
              onPress={onBack ?? (() => router.back())}
              className='w-10 h-10 rounded-full bg-white items-center justify-center '
              hitSlop={8}
              accessibilityRole='button'
              accessibilityLabel='Go back'
            >
              <Ionicons name='chevron-back' size={20} color='#111' />
            </Pressable>
          ) : null}
        </View>

        {/* Center: title */}
        <View className='flex-1 items-center'>
          <Text
            numberOfLines={1}
            className='text-lg font-bold text-neutral-900'
            accessibilityRole='header'
          >
            {title}
          </Text>
        </View>

        {/* Right: action or spacer to balance layout */}
        <View className='w-10 h-10 items-center justify-center'>
          {right ?? null}
        </View>
      </View>
    </View>
  );
}
