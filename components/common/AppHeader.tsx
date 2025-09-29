import React from 'react';
import { View, Text, Pressable, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    badge?: number;
  };
  /** 'default' ~44–48pt, 'large' ~64pt, 'transparent' keeps bg transparent */
  variant?: 'default' | 'large' | 'transparent';
  showBorder?: boolean;
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  variant = 'default',
  showBorder = true,
}: AppHeaderProps) {
  const isLarge = variant === 'large';
  const isTransparent = variant === 'transparent';

  const bgClass = isTransparent ? 'bg-transparent' : 'bg-white';
  const borderClass =
    showBorder && !isTransparent ? 'border-b border-neutral-100' : '';

  // Heights kept tight: default row ≈ 44–48pt, large ≈ 60–64pt
  const rowHeightClass = isLarge ? 'h-16' : 'h-12';
  const titleSizeClass = isLarge ? 'text-xl' : 'text-base'; // smaller than before
  const subtitleSizeClass = isLarge ? 'text-sm' : 'text-xs'; // compact

  return (
    <>
      {Platform.OS === 'android' && (
        <StatusBar barStyle='dark-content' backgroundColor='white' />
      )}

      <SafeAreaView
        edges={['bottom']}
        // Apply ONLY the top inset; avoid extra top/bottom paddings.
        className={`${bgClass} ${borderClass} pt-4`}
      >
        <View className='px-4'>
          <View
            className={`flex-row items-center justify-between ${rowHeightClass}`}
          >
            {/* Left: back */}
            <View className='w-11 h-11 justify-center'>
              {onBack && (
                <Pressable
                  onPress={onBack}
                  className='w-10 h-10 rounded-full items-center justify-center active:bg-neutral-100'
                  accessibilityLabel='Go back'
                  accessibilityRole='button'
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name='chevron-back' size={22} color='#374151' />
                </Pressable>
              )}
            </View>

            {/* Center: title + optional subtitle (kept tight) */}
            <View className='flex-1 items-center justify-center px-2'>
              <Text
                className={`font-semibold text-neutral-900 text-center ${titleSizeClass}`}
                numberOfLines={1}
              >
                {title}
              </Text>
              {!!subtitle && (
                <Text
                  className={`text-neutral-500 text-center ${subtitleSizeClass} mt-0.5`}
                  numberOfLines={1}
                >
                  {subtitle}
                </Text>
              )}
            </View>

            {/* Right: action */}
            <View className='w-11 h-11 items-end justify-center'>
              {rightAction && (
                <Pressable
                  onPress={rightAction.onPress}
                  className='w-10 h-10 rounded-full items-center justify-center active:bg-neutral-100 relative'
                  accessibilityRole='button'
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name={rightAction.icon} size={20} color='#374151' />
                  {rightAction.badge && rightAction.badge > 0 && (
                    <View className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center'>
                      <Text className='text-white text-[10px] font-bold'>
                        {rightAction.badge > 99 ? '99+' : rightAction.badge}
                      </Text>
                    </View>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

/** Keep these convenience variants unchanged */
export const HomeHeader = ({
  cartCount,
  onCartPress,
}: {
  cartCount?: number;
  onCartPress: () => void;
}) => (
  <AppHeader
    title='NaijaGasOnline'
    variant='large' // only Home should look taller
    rightAction={{
      icon: 'cart-outline',
      onPress: onCartPress,
      badge: cartCount,
    }}
  />
);

export const OrdersHeader = ({
  onNotificationsPress,
}: {
  onNotificationsPress: () => void;
}) => (
  <AppHeader
    title='My Orders'
    rightAction={{
      icon: 'notifications-outline',
      onPress: onNotificationsPress,
    }}
  />
);

export const SettingsHeader = () => (
  <AppHeader title='Settings' subtitle='Manage your account' />
);

export default AppHeader;
