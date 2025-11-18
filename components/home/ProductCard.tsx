import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export type ProductCardProps = {
  product: {
    id: string;
    title: string;
    price: number;
    image?: string;
    rating?: number;
    seller_name?: string;
  };
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
};

const NGN = (n: number) => `₦${n.toLocaleString('en-NG')}`;

export function ProductCard({
  product,
  qty,
  onAdd,
  onInc,
  onDec,
}: ProductCardProps) {
  const imageUri =
    product.image ||
    'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800';
  const rating = product.rating ?? 4.6;
  const vendor = product.seller_name ?? 'Vendor';

  return (
    <View className='bg-white rounded-3xl overflow-hidden border border-neutral-100 flex-1'>
      {/* Tappable area */}
      <Pressable onPress={() => router.push(`/home/product/${product.id}`)}>
        <View
          className='bg-neutral-100 items-center justify-center rounded-3xl overflow-hidden'
          style={{ height: 144 }}
        >
          <Image
            source={{ uri: imageUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode='contain'
          />
        </View>

        <View className='px-3 pt-3 pb-1'>
          <Text className='font-semibold text-neutral-900' numberOfLines={2}>
            {product.title}
          </Text>
          <View className='mt-1 flex-row items-center'>
            <Text className='text-emerald-700'>{vendor}</Text>
            <Ionicons
              name='star'
              size={12}
              color='#FFD700'
              style={{ marginLeft: 8 }}
            />
            <Text className='text-neutral-600 text-xs ml-1'>
              {rating.toFixed(1)}
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Price + Cart */}
      <View className='px-3 pb-3 mt-1 flex-row items-center justify-between'>
        <Text className='text-neutral-900 font-bold'>{NGN(product.price)}</Text>

        {qty > 0 ? (
          <View className='flex-row items-center bg-neutral-100 rounded-full'>
            <Pressable
              onPress={onDec}
              className='w-8 h-8 items-center justify-center'
            >
              <Ionicons name='remove' size={18} color='#111' />
            </Pressable>
            <Text className='mx-2 font-semibold'>{qty}</Text>
            <Pressable
              onPress={onInc}
              className='w-8 h-8 items-center justify-center'
            >
              <Ionicons name='add' size={18} color='#111' />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={onAdd}
            className='w-9 h-9 rounded-full items-center justify-center bg-primary-600'
          >
            <Ionicons name='add' size={20} color='#fff' />
          </Pressable>
        )}
      </View>
    </View>
  );
}
