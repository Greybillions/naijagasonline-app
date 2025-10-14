// app/(tabs)/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/stores/cart.store';
import HelpBanner from '@/components/home/HelpBanner';

/* ----------------------------- types / helpers ---------------------------- */
type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  subtitle?: string;
  description?: string;
  rating?: number;
  kg?: string;
  phone?: string;
  state?: string;
  city?: string;
  seller_name?: string;
};

const NGN = (n: number) => `₦${n.toLocaleString('en-NG')}`;

/* ------------------------------ tiny skeleton ----------------------------- */
const ProductCardSkeleton = () => (
  <View className='w-1/2 px-2 pb-4'>
    <View className='bg-white rounded-3xl overflow-hidden border border-neutral-100'>
      <View className='h-36 bg-neutral-100' />
      <View className='px-3 pt-3 pb-4'>
        <View className='h-4 w-3/4 bg-neutral-200 rounded mb-2' />
        <View className='h-3 w-1/2 bg-neutral-200 rounded mb-3' />
        <View className='h-4 w-1/3 bg-neutral-200 rounded' />
      </View>
    </View>
  </View>
);

/* ----------------------------- product card UI ---------------------------- */
function ProductCard({
  product,
  qty,
  onAdd,
  onInc,
  onDec,
}: {
  product: Product;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
}) {
  const imageUri =
    product.image ||
    'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800';
  const rating = product.rating ?? 4.6;
  const vendor = product.seller_name ?? 'Vendor';

  return (
    <View className='w-1/2 px-2 pb-4'>
      <View className='bg-white rounded-3xl overflow-hidden border border-neutral-100'>
        {/* tap to open product page */}
        <Pressable onPress={() => router.push(`/home/product/${product.id}`)}>
          <View className='h-36 bg-neutral-100'>
            <Image
              source={{ uri: imageUri }}
              resizeMode='cover'
              style={{ width: '100%', height: '100%' }}
            />
          </View>

          <View className='px-3 pt-3 pb-1'>
            <Text className='font-semibold text-neutral-900' numberOfLines={2}>
              {product.title}
            </Text>
            <View className='mt-1 flex-row items-center'>
              <Text className='text-primary-700'>{vendor}</Text>
              <Ionicons
                name='star'
                size={12}
                color='#020084'
                style={{ marginLeft: 8 }}
              />
              <Text className='text-neutral-600 text-xs ml-1'>
                {rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* price + cart controls */}
        <View className='px-3 pb-3 mt-1 flex-row items-center justify-between'>
          <Text className='text-neutral-900 font-bold'>
            {NGN(product.price)}
          </Text>

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
              className='w-9 h-9 rounded-full items-center justify-center bg-primary-600 active:bg-primary-700'
            >
              <Ionicons name='add' size={20} color='#fff' />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

/* ------------------------------ home screen ------------------------------- */
export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  // at the top of HomeScreen()
  const itemCount = useCartStore((s) =>
    s.lines.reduce((n, l) => n + (l.qty ?? 0), 0)
  );

  // address coming from coverage page params
  const params = useLocalSearchParams<{
    from?: string;
    addressLabel?: string;
    addressDetails?: string;
    lat?: string;
    lng?: string;
  }>();
  const addressDetails = Array.isArray(params.addressDetails)
    ? params.addressDetails[0]
    : (params.addressDetails ?? '');

  // cart store
  const add = useCartStore((s) => s.add);
  const inc = useCartStore((s) => s.inc);
  const dec = useCartStore((s) => s.dec);
  const lines = useCartStore((s) => s.lines);

  const qtyFor = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;

  const cartItems = useMemo(
    () => lines.reduce((a, l) => a + (l.qty ?? 0), 0),
    [lines]
  );
  const cartTotal = useMemo(() => {
    return lines.reduce((sum, l) => {
      const linePrice =
        (l as any).price ?? products.find((p) => p.id === l.id)?.price ?? 0;
      return sum + linePrice * (l.qty ?? 0);
    }, 0);
  }, [lines, products]);

  // fetch from Supabase
  const fetchProducts = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('title', { ascending: true });
      if (error) throw error;
      setProducts(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // categories from kg
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      const kgRaw = p?.kg;
      const kg =
        typeof kgRaw === 'string' ? kgRaw : kgRaw == null ? '' : String(kgRaw);
      const cleaned = kg.trim();
      if (cleaned) set.add(cleaned);
    }
    return Array.from(set);
  }, [products]);

  // filtered products
  const filtered = useMemo(() => {
    const q = (query ?? '').trim().toLowerCase();
    return products.filter((p) => {
      const title = String(p?.title ?? '').toLowerCase();
      const seller = String(p?.seller_name ?? '').toLowerCase();
      const kg = String(p?.kg ?? '').toLowerCase();
      const state = String(p?.state ?? '').toLowerCase();
      const city = String(p?.city ?? '').toLowerCase();
      const kgForMatch = String(p?.kg ?? '').trim();

      if (activeCat && kgForMatch !== activeCat) return false;
      if (!q) return true;

      return (
        title.includes(q) ||
        seller.includes(q) ||
        kg.includes(q) ||
        state.includes(q) ||
        city.includes(q)
      );
    });
  }, [products, activeCat, query]);

  /* ----------------------------- header renderer ---------------------------- */
  const renderHeader = () => (
    <View className='px-4 mb-3 pt-4 space-y-3'>
      {/* location + settings */}
      <View className='flex-row items-center justify-between mb-3'>
        <Pressable
          className='flex-row items-center bg-white rounded-full px-3 py-2 border border-primary-200'
          onPress={() => router.push('/address')}
        >
          <Ionicons name='location' size={16} color='#020084' />
          <Text
            className='ml-2 text-primary-900 font-semibold'
            numberOfLines={1}
          >
            {addressDetails || 'Choose address'}
          </Text>
          <Ionicons name='chevron-down' size={16} color='#020084' />
        </Pressable>

        <Pressable
          className='w-10 h-10 rounded-full bg-white items-center justify-center border border-neutral-200 relative'
          onPress={() => router.push('/(tabs)/cart')}
          accessibilityRole='button'
          accessibilityLabel='Open cart'
        >
          <Ionicons name='cart-outline' size={18} color='#111' />

          {itemCount > 0 && (
            <View className='absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary-600 items-center justify-center'>
              <Text
                className='text-white text-[10px] font-bold'
                numberOfLines={1}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* search */}
      <View className='bg-white rounded-full px-4 py-3 border border-neutral-200'>
        <View className='flex-row items-center'>
          <Ionicons name='search' size={18} color='#6B7280' />
          <TextInput
            placeholder='Search products, vendors, KG...'
            value={query}
            onChangeText={setQuery}
            className='ml-2 flex-1'
            placeholderTextColor='#9CA3AF'
            autoCorrect={false}
            returnKeyType='search'
          />
          {query ? (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name='close-circle' size={18} color='#9CA3AF' />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* banner */}
      <HelpBanner />

      {/* categories */}
      {categories.length > 0 && (
        <FlatList
          data={categories}
          horizontal
          keyExtractor={(x) => x}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 14 }}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          renderItem={({ item }) => {
            const active = activeCat === item;
            return (
              <Pressable
                onPress={() =>
                  setActiveCat((prev) => (prev === item ? null : item))
                }
                className={`px-4 h-9 rounded-full border ${
                  active
                    ? 'bg-primary-100 border-primary-300'
                    : 'bg-white border-neutral-200'
                } justify-center`}
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

      {/* error */}
      {error && (
        <View className='mt-2 p-3 rounded-xl bg-red-50 border border-red-100'>
          <Text className='text-red-700'>Failed to load products: {error}</Text>
        </View>
      )}
    </View>
  );

  /* --------------------------------- ui ---------------------------------- */
  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-neutral-50'>
        <FlatList
          data={Array.from({ length: 8 }).map((_, i) => `s-${i}`)}
          keyExtractor={(k) => k}
          numColumns={2}
          ListHeaderComponent={renderHeader}
          renderItem={() => <ProductCardSkeleton />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            qty={qtyFor(item.id)}
            onAdd={() => add(item)}
            onInc={() => inc(item.id)}
            onDec={() => dec(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 50 }}
        ListEmptyComponent={
          <View className='px-4'>
            <View className='bg-white rounded-2xl p-6 border border-neutral-100'>
              <Text className='text-neutral-900 font-bold text-lg mb-2'>
                No products found
              </Text>
              <Text className='text-neutral-600'>
                Try clearing filters or searching something else.
              </Text>
            </View>
          </View>
        }
      />

      {/* sticky cart bar */}
      {cartItems > 0 && (
        <View className='absolute left-0 right-0 bottom-2 px-4'>
          <Pressable
            onPress={() => router.push('/(tabs)/cart')}
            className='h-12 rounded-full bg-primary-700 active:bg-primary-800 items-center justify-center'
          >
            <Text className='text-white font-bold'>
              {cartItems} {cartItems === 1 ? 'item' : 'items'} •{' '}
              {NGN(cartTotal)} — View Cart
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
