// app/index.tsx
import { View, Text, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { MotiView, MotiText, AnimatePresence } from 'moti';

export default function SplashScreen() {
  // auto navigate to home after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/home');
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className='flex-1 bg-primary-900'>
      <View className='flex-1 relative'>
        <ImageBackground
          source={require('@/assets/images/ngo1.png')}
          resizeMode='cover'
          className='absolute inset-0'
        >
          <View className='absolute inset-0 bg-primary-900/70' />
        </ImageBackground>

        {/* HEADER */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          className='px-6 pt-8'
        >
          <Text className='text-white text-xl font-semibold tracking-wide'>
            Welcome
          </Text>
        </MotiView>

        {/* BRAND BLOCK */}
        <View className='flex-1 justify-center items-center px-6'>
          <AnimatePresence>
            <MotiView
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'timing', duration: 900 }}
              className='items-center'
            >
              <MotiText
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 300 }}
                className='text-white text-4xl font-extrabold text-center leading-tight'
              >
                NaijaGasOnline
              </MotiText>

              <MotiText
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: 500 }}
                className='text-primary-100 mt-4 text-lg text-center'
              >
                Fast, reliable, and convenient gas delivery.
              </MotiText>
            </MotiView>
          </AnimatePresence>
        </View>

        {/* LOADING DOTS */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 900 }}
          className='items-center pb-10'
        >
          <LoadingDots />
        </MotiView>
      </View>
    </SafeAreaView>
  );
}

/* ----------------------- Tiny Loading Animation ----------------------- */

function LoadingDots() {
  return (
    <View className='flex-row gap-2'>
      {[0, 1, 2].map((i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.3, translateY: 0 }}
          animate={{ opacity: 1, translateY: -4 }}
          transition={{
            type: 'timing',
            duration: 600,
            loop: true,
            delay: i * 200,
          }}
          className='w-2 h-2 rounded-full bg-white/90'
        />
      ))}
    </View>
  );
}
