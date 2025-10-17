import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { height } = Dimensions.get('window');

type Link = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function HelpBanner() {
  const [open, setOpen] = useState(false);

  // simple pulse animation for CTA
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  const links: Link[] = [
    {
      label: 'Buy Gas Online',
      subtitle: 'Order quick refills and accessories instantly.',
      icon: 'cart-outline',
      onPress: () => {
        setOpen(false);
        router.push('/(stack)/home/product/quick-refill');
      },
    },
    {
      label: 'Get a Service',
      subtitle: 'Installation, maintenance, and safety checks.',
      icon: 'build-outline',
      onPress: () => {
        setOpen(false);
        router.push('/(stack)/home/product/service');
      },
    },
    {
      label: 'Join Us',
      subtitle: 'Become a vendor, technician, or delivery partner.',
      icon: 'people-outline',
      onPress: () => {
        setOpen(false);
        router.push('/(stack)/home/product/join');
      },
    },
  ];

  return (
    <>
      {/* Banner (wine background, 60% screen height) */}
      <View
        className='mt-4 overflow-hidden rounded-3xl '
        style={{ height: height * 0.5 }}
      >
        <View className='flex-1 bg-[#7b0323] px-6 py-8 justify-center gap-3'>
          <Text className='text-white text-4xl font-extrabold leading-tight mb-2'>
            Welcome to {'\n'} NaijaGasOnline
          </Text>
          <Text className='text-neutral-100 text-lg mb-4'>
            Your one-stop platform for gas refills, installations, and reliable
            home delivery {'\n'} — all at your fingertips.
          </Text>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPress={() => setOpen(true)}
              className='bg-white self-start rounded-full px-7 py-4 active:opacity-90 shadow-md shadow-black/20'
            >
              <Text className='text-[#7b0323] font-extrabold text-lg tracking-wide'>
                Tap to Get Started!
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Slide-up Modal */}
      <Modal
        transparent
        animationType='slide'
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View className='flex-1 bg-black/40' />
        </TouchableWithoutFeedback>

        <View className='bg-white rounded-t-3xl px-5 pt-5 pb-6'>
          <View className='items-center mb-3'>
            <View className='w-10 h-1.5 rounded-full bg-neutral-300' />
          </View>

          <Text className='text-neutral-900 text-lg font-extrabold mb-1'>
            How can we help?
          </Text>
          <Text className='text-neutral-600 mb-4'>
            Select a category below to continue.
          </Text>

          {links.map((link) => (
            <Pressable
              key={link.label}
              onPress={link.onPress}
              className='flex-row items-center justify-between bg-neutral-50 active:bg-neutral-100 border border-neutral-200 rounded-2xl px-4 py-4 mb-2'
            >
              <View className='flex-row items-center flex-1 pr-2'>
                <View className='w-9 h-9 rounded-full bg-[#7b0323]/10 items-center justify-center mr-3'>
                  <Ionicons name={link.icon} size={20} color='#7b0323' />
                </View>
                <View className='flex-1'>
                  <Text className='text-neutral-900 font-semibold'>
                    {link.label}
                  </Text>
                  <Text className='text-neutral-500 text-xs mt-0.5'>
                    {link.subtitle}
                  </Text>
                </View>
              </View>
              <Ionicons name='chevron-forward' size={18} color='#9CA3AF' />
            </Pressable>
          ))}

          <Pressable
            onPress={() => setOpen(false)}
            className='mt-2 h-12 rounded-2xl border border-neutral-200 items-center justify-center'
          >
            <Text className='text-neutral-800 font-semibold'>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}
