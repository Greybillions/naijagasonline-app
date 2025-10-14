import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { AppHeader } from '@/components/common/AppHeader';
import { LoadingButton } from '@/components/common/LoadingComponents';
import { useCartStore } from '@/stores/cart.store';

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

  refill_price?: number | null;
  new_cylinder_price?: number | null;

  addons?: string[] | { id: string }[] | null;
};

const NGN = (n: number) => `₦${(n ?? 0).toLocaleString('en-NG')}`;

export default function ProductScreen() {
  const params = useLocalSearchParams();

  const productId: string | undefined = useMemo(() => {
    const raw =
      (Array.isArray(params.id) ? params.id[0] : (params.id as string)) ??
      (Array.isArray(params.productId)
        ? params.productId[0]
        : (params.productId as string));
    return raw || undefined;
  }, [params]);

  const addToCart = useCartStore((s) => s.add);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [addons, setAddons] = useState<Product[]>([]);
  const [option, setOption] = useState<'refill' | 'new' | 'default'>('default');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!productId) {
        if (mounted) {
          setLoading(false);
          Alert.alert('Missing product', 'No product id was provided.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }
        return;
      }

      try {
        setLoading(true);

        // 1) Main product
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .maybeSingle();

        if (!mounted) return;

        if (error) {
          setLoading(false);
          Alert.alert('Error', error.message);
          return;
        }
        if (!data) {
          setLoading(false);
          Alert.alert('Not found', 'This product is unavailable.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
          return;
        }

        setProduct(data);

        // 2) Add-ons (best-effort)
        try {
          const ids = normalizeAddonIds(data.addons);
          if (ids.length) {
            const { data: addonRows } = await supabase
              .from('products')
              .select('*')
              .in('id', ids);
            if (mounted && addonRows) setAddons(addonRows);
          } else {
            const { data: rel } = await supabase
              .from('product_addons')
              .select('addon:products(*)')
              .eq('product_id', productId);
            if (mounted && rel?.length) {
              setAddons(rel.map((r: any) => r.addon).filter(Boolean));
            }
          }
        } catch {
          /* ignore */
        }

        if (mounted) setLoading(false);
      } catch (e: any) {
        if (!mounted) return;
        setLoading(false);
        Alert.alert('Error', e?.message ?? 'Failed to load product.');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const hasDualPrices =
    !!product?.refill_price || !!product?.new_cylinder_price;

  const activePrice = useMemo(() => {
    if (!product) return 0;
    if (option === 'refill' && product.refill_price != null)
      return product.refill_price;
    if (option === 'new' && product.new_cylinder_price != null)
      return product.new_cylinder_price;
    return product.price ?? 0;
  }, [product, option]);

  function onShare() {
    if (!product) return;
    Share.share({
      title: product.title,
      message: `${product.title} — ${NGN(activePrice)}`,
    }).catch(() => {});
  }

  async function handleAddToCart(p: Product) {
    try {
      setAdding(true);
      addToCart({
        id: p.id,
        title: p.title,
        price: p.price,
        image: p.image,
      } as any);
      Alert.alert('Added to cart', p.title);
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView className='flex-1 bg-neutral-50'>
        <AppHeader title='Product' onBack={() => router.back()} />
        <View className='flex-1 items-center justify-center'>
          <ActivityIndicator size='large' color='#020084' />
          <Text className='text-neutral-600 mt-3'>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className='flex-1 bg-neutral-50'>
        <AppHeader title='Product' onBack={() => router.back()} />
        <View className='flex-1 items-center justify-center px-6'>
          <Text className='text-neutral-900 font-bold text-lg mb-2'>
            Product not found
          </Text>
          <Text className='text-neutral-600 text-center'>
            The item you’re looking for isn’t available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const vendor = product.seller_name ?? 'Vendor';
  const imageUri =
    product.image ||
    'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800';

  return (
    <SafeAreaView className='flex-1 bg-neutral-50'>
      <AppHeader
        title='Product'
        onBack={() => router.back()}
        rightAction={{ icon: 'share-outline', onPress: onShare }}
      />

      <ScrollView
        className='flex-1'
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* hero image */}
        <View className='mx-4 rounded-3xl overflow-hidden bg-neutral-200'>
          <Image
            source={{ uri: imageUri }}
            resizeMode='cover'
            style={{ width: '100%', height: 220 }}
          />
        </View>

        {/* title + vendor + prices card */}
        <View className='mx-4 -mt-5 bg-white rounded-3xl p-4 border border-neutral-100 shadow-sm'>
          <View className='self-start px-2 py-1 rounded-full bg-primary-50 border border-primary-100 mb-2'>
            <Text className='text-primary-700 text-[12px]'>
              Vendor: {vendor}
            </Text>
          </View>

          <Text className='text-neutral-900 font-extrabold text-lg'>
            {product.title}
          </Text>

          {/* two prices */}
          {hasDualPrices ? (
            <View className='flex-row justify-between mt-3'>
              <View>
                <Text className='text-neutral-500 text-xs mb-1'>
                  Refill Price
                </Text>
                <Text className='text-neutral-900 font-extrabold'>
                  {NGN(product.refill_price ?? product.price)}
                </Text>
              </View>
              <View className='items-end'>
                <Text className='text-neutral-500 text-xs mb-1'>
                  New Cylinder
                </Text>
                <Text className='text-neutral-900 font-extrabold'>
                  {NGN(product.new_cylinder_price ?? product.price)}
                </Text>
              </View>
            </View>
          ) : (
            <View className='mt-2'>
              <Text className='text-neutral-500 text-xs mb-1'>Price</Text>
              <Text className='text-neutral-900 font-extrabold'>
                {NGN(product.price)}
              </Text>
            </View>
          )}
        </View>

        {/* purchase option */}
        {hasDualPrices && (
          <View className='mx-4 mt-4 bg-white rounded-2xl p-3 border border-neutral-100'>
            <Text className='text-neutral-900 font-extrabold mb-3'>
              Purchase Option
            </Text>

            <View className='flex-row gap-3'>
              <OptionChip
                active={option === 'refill'}
                label={`Refill\n${NGN(product.refill_price ?? product.price)}`}
                onPress={() => setOption('refill')}
              />
              <OptionChip
                active={option === 'new'}
                label={`New Cylinder\n${NGN(
                  product.new_cylinder_price ?? product.price
                )}`}
                onPress={() => setOption('new')}
              />
            </View>
          </View>
        )}

        {/* Add to cart button */}
        <View className='mx-4 mt-3'>
          <LoadingButton
            onPress={() => handleAddToCart(product)}
            loading={adding}
            className='h-12 rounded-2xl bg-primary-700 active:bg-primary-800'
          >
            Add to Cart
          </LoadingButton>
        </View>

        {/* specs */}
        <View className='mx-4 mt-4 bg-white rounded-2xl border border-neutral-100'>
          <Text className='px-4 pt-4 pb-2 text-neutral-900 font-extrabold'>
            Specifications
          </Text>
          <SpecRow
            label='Capacity'
            value={product.kg ? `${product.kg}` : '—'}
          />
          {!!product.subtitle && (
            <SpecRow label='Type' value={product.subtitle} />
          )}
          {!!product.state && !!product.city && (
            <SpecRow
              label='Location'
              value={`${product.city}, ${product.state}`}
            />
          )}
          {!!product.description && (
            <View className='px-4 py-3 border-t border-neutral-100'>
              <Text className='text-neutral-700'>{product.description}</Text>
            </View>
          )}
        </View>

        {/* Add-ons */}
        {addons.length > 0 && (
          <View className='mx-4 mt-4'>
            <Text className='text-neutral-900 font-extrabold mb-3'>
              Add-ons
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className='flex-row gap-3'>
                {addons.map((a) => (
                  <View
                    key={a.id}
                    className='w-36 bg-white rounded-2xl border border-neutral-100 overflow-hidden'
                  >
                    <View className='h-24 bg-neutral-100'>
                      <Image
                        source={{
                          uri:
                            a.image ||
                            'https://images.unsplash.com/photo-1542751110-97427bbecf20?q=80&w=800',
                        }}
                        resizeMode='cover'
                        style={{ width: '100%', height: '100%' }}
                      />
                    </View>
                    <View className='p-3'>
                      <Text
                        className='text-neutral-900 font-medium'
                        numberOfLines={2}
                      >
                        {a.title}
                      </Text>
                      <Text className='text-neutral-700 mt-1'>
                        {NGN(a.price)}
                      </Text>
                      <Pressable
                        onPress={() => handleAddToCart(a)}
                        className='mt-2 h-9 rounded-full bg-primary-700 active:bg-primary-800 items-center justify-center'
                      >
                        <Text className='text-white font-semibold'>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* delivery estimate */}
        <View className='mx-4 mt-4 mb-6 bg-white rounded-2xl p-3 border border-neutral-100 flex-row items-center gap-3'>
          <View className='w-9 h-9 rounded-full bg-primary-50 items-center justify-center'>
            <Ionicons name='bicycle-outline' size={18} color='#020084' />
          </View>
          <View>
            <Text className='text-neutral-900 font-semibold'>
              Estimated Delivery
            </Text>
            <Text className='text-neutral-600'>Tomorrow, 9 AM – 12 PM</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** --- Helpers & tiny components --- */

function normalizeAddonIds(input: Product['addons']): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    const ids: string[] = [];
    for (const x of input) {
      if (typeof x === 'string') ids.push(x);
      else if (
        x &&
        typeof x === 'object' &&
        'id' in x &&
        typeof x.id === 'string'
      )
        ids.push(x.id);
    }
    return ids;
  }
  return [];
}

function OptionChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-2xl px-3 py-3 border ${
        active
          ? 'border-primary-300 bg-primary-50'
          : 'border-neutral-200 bg-white'
      }`}
    >
      <Text
        className={
          active ? 'text-primary-700 font-semibold' : 'text-neutral-800'
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SpecRow({ label, value }: { label: string; value?: string }) {
  return (
    <View className='px-4 py-3 border-t border-neutral-100 flex-row items-center justify-between'>
      <Text className='text-neutral-600'>{label}</Text>
      <Text className='text-neutral-900 font-semibold'>{value ?? '—'}</Text>
    </View>
  );
}
