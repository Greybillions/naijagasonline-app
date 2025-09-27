// app/index.tsx
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Onboarding() {
  return (
    <SafeAreaView className='flex-1 bg-emerald-900'>
      <View className='flex-1 relative'>
        <ImageBackground
          source={require('@/assets/images/ngo1.png')}
          resizeMode='cover'
          className='absolute inset-0'
        >
          <View className='absolute inset-0 bg-emerald-900/60' />
        </ImageBackground>

        <View className='flex-1 justify-end px-6 pb-8'>
          <Text className='text-white text-4xl font-extrabold tracking-tight leading-tight'>
            NaijaGasOnline
          </Text>
          <Text className='text-emerald-50 mt-3 text-lg leading-6 font-medium'>
            Fast, reliable, and convenient gas delivery{'\n'}right to your
            doorstep.
          </Text>
        </View>
      </View>

      <View className='px-4 pb-8'>
        <View className='items-center -mb-8 z-20'>
          <View className='w-16 h-16 rounded-full bg-white items-center justify-center shadow-lg border border-emerald-100'>
            <Ionicons name='location-outline' size={26} color='#0C6B4A' />
          </View>
        </View>

        <View className='bg-white rounded-3xl px-6 py-8 pt-12 shadow-xl border border-gray-100'>
          <View className='items-center'>
            <Text className='text-xl font-bold text-neutral-900 mb-2'>
              Ready to Order?
            </Text>
            <Text className='text-neutral-600 text-center leading-5 mb-6'>
              Set your delivery address to get started.
            </Text>

            <Pressable
              onPress={() => router.push('/address')}
              className='w-full h-14 rounded-2xl bg-emerald-900 flex-row items-center justify-center space-x-3 shadow-lg'
            >
              <Ionicons name='navigate-outline' size={20} color='#fff' />
              <Text className='text-white font-semibold text-lg'>
                Set Delivery Address
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.replace('/(tabs)/home')}
              className='mt-4 py-2 px-4'
            >
              <Text className='text-neutral-500 text-sm underline'>
                Skip for now
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
