import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

type Link = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function HelpBanner() {
  const [open, setOpen] = useState(false);

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
        router.push('/(stack)/home/product/service'); // change to your route
      },
    },
    {
      label: 'Join Us',
      subtitle: 'Become a vendor, technician, or delivery partner.',
      icon: 'people-outline',
      onPress: () => {
        setOpen(false);
        router.push('/(stack)/home/product/join'); // change to your route
      },
    },
  ];

  return (
    <>
      {/* Banner */}
      <View className='mt-4 bg-primary-700 rounded-3xl px-5 py-5'>
        <Text className='text-white text-lg font-extrabold'>
          We’re here to help
        </Text>
        <Text className='text-primary-100 mt-1'>
          Certified vendors. Fast delivery.
        </Text>

        <Pressable
          onPress={() => setOpen(true)}
          className='self-start mt-3 bg-white rounded-full px-4 py-2'
        >
          <Text className='text-primary-700 font-bold'>
            How can we help you?
          </Text>
        </Pressable>
      </View>

      {/* Slide-up sheet */}
      <Modal
        transparent
        animationType='slide'
        visible={open}
        onRequestClose={() => setOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View className='flex-1 bg-black/40' />
        </TouchableWithoutFeedback>

        <View className='bg-white rounded-t-3xl px-4 pt-4 pb-6'>
          {/* drag handle */}
          <View className='items-center mb-3'>
            <View className='w-10 h-1.5 rounded-full bg-neutral-300' />
          </View>

          <Text className='text-neutral-900 text-lg font-extrabold mb-2'>
            How can we help?
          </Text>
          <Text className='text-neutral-600 mb-4'>
            Choose an option to continue
          </Text>

          {links.map((link) => (
            <Pressable
              key={link.label}
              onPress={link.onPress}
              className='flex-row items-center justify-between bg-neutral-50 active:bg-neutral-100 border border-neutral-200 rounded-2xl px-4 py-4 mb-2'
            >
              <View className='flex-row items-center flex-1 pr-2'>
                <View className='w-9 h-9 rounded-full bg-primary-50 items-center justify-center mr-3'>
                  <Ionicons name={link.icon} size={18} color='#020084' />
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
