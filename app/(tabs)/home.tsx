import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { Easing } from 'react-native-reanimated';

import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/stores/cart.store';
import HelpBanner from '@/components/home/HelpBanner';
import { ProductCard } from '@/components/home/ProductCard';

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  subtitle?: string;
  description?: string;
  rating?: number;
  kg?: any; // string | number | null
  seller_name?: string;
};

/* LOADING SKELETON */
const ProductSkeleton = () => (
  <MotiView
    from={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ loop: true, duration: 1000 }}
    className='w-1/2 px-2 pb-4'
  >
    <View className='bg-white rounded-3xl overflow-hidden border border-neutral-100'>
      <View className='h-36 bg-neutral-200/50' />
      <View className='px-3 pt-3 pb-4'>
        <View className='h-4 w-3/4 bg-neutral-200 rounded mb-2' />
        <View className='h-3 w-1/2 bg-neutral-200 rounded mb-3' />
        <View className='h-4 w-1/3 bg-neutral-200 rounded' />
      </View>
    </View>
  </MotiView>
);

/* ------------------------------- HOME SCREEN ------------------------------- */
export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query] = useState('');
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const add = useCartStore((s) => s.add);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const lines = useCartStore((s) => s.lines);

  const cartItems = useMemo(
    () => lines.reduce((sum, l) => sum + (l.qty ?? 0), 0),
    [lines]
  );

  const qtyFor = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;

  /* Fetch */
  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*');
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  /* Categories */
  const categories = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => {
      const x = String(p.kg ?? '').trim();
      if (x) s.add(x);
    });
    return [...s];
  }, [products]);

  /* Filter */
  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return products.filter((p) => {
      const title = String(p.title ?? '').toLowerCase();
      const vendor = String(p.seller_name ?? '').toLowerCase();
      const kg = String(p.kg ?? '').toLowerCase();

      const matchQuery =
        !q || title.includes(q) || vendor.includes(q) || kg.includes(q);

      const matchCat = !activeCat || String(p.kg ?? '').trim() === activeCat;

      return matchQuery && matchCat;
    });
  }, [products, query, activeCat]);

  /* HEADER */
  const renderHeader = () => (
    <View className='px-4 pt-4 space-y-6'>
      {/* ★ Clean Hero */}
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ duration: 500 }}
        className=' rounded-3xl px-6 py-6 shadow-md'
      >
        <Text className='text-black text-3xl font-extrabold tracking-tight'>
          NaijaGasOnline
        </Text>
        <Text className='text-gray-700 mt-1'>
          Fast gas refills • Quality cylinders • Instant delivery.
        </Text>
      </MotiView>

      <HelpBanner />

      {/* Categories */}
      {categories.length > 0 && (
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(x) => x}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item }) => {
            const active = activeCat === item;
            return (
              <Pressable
                onPress={() =>
                  setActiveCat((prev) => (prev === item ? null : item))
                }
                className={`px-4 h-9 rounded-full border justify-center ${
                  active
                    ? 'bg-primary-100 border-primary-300'
                    : 'bg-white border-neutral-200'
                }`}
              >
                <Text
                  className={
                    active
                      ? 'text-primary-700 font-semibold'
                      : 'text-neutral-700'
                  }
                >
                  {item}kg
                </Text>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );

  /* LOADING */
  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-neutral-50'>
        <FlatList
          data={Array.from({ length: 8 })}
          numColumns={2}
          keyExtractor={(i, k) => String(k)}
          ListHeaderComponent={renderHeader}
          renderItem={() => <ProductSkeleton />}
        />
      </SafeAreaView>
    );
  }

  /* MAIN UI */
  return (
    <SafeAreaView className='flex bg-neutral-50'>
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: 3 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <MotiView
            from={{ opacity: 0, scale: 0.95, translateY: 8 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 220 }}
            style={{ flex: 1, marginBottom: 16 }}
          >
            <ProductCard
              product={item}
              qty={qtyFor(item.id)}
              onAdd={() => add(item)}
              onInc={() => inc(item.id)}
              onDec={() => dec(item.id)}
            />
          </MotiView>
        )}
      />

      {/* Floating Cart Icon — top-right, clean, minimal */}
      <Pressable
        onPress={() => router.push('/(tabs)/cart')}
        style={styles.floatingCart}
      >
        <MotiView
          from={{ scale: 1 }}
          animate={{ scale: cartItems > 0 ? 1.08 : 1 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
          }}
          style={styles.fab}
        >
          <Ionicons name='cart-outline' size={26} color='#fff' />
          {cartItems > 0 && (
            <View style={styles.badge}>
              <Text className='text-white text-[10px] font-bold'>
                {cartItems > 99 ? '99+' : cartItems}
              </Text>
            </View>
          )}
        </MotiView>
      </Pressable>
    </SafeAreaView>
  );
}

/* -------------------------------- STYLES -------------------------------- */
const styles = StyleSheet.create({
  floatingCart: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 50,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1010aa',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
