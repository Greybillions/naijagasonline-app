import React from 'react';
import { FlatList, View } from 'react-native';
import { ProductCard } from './ProductCard';

type Product = {
  id: string;
  title: string;
  price: number;
  image?: string;
  rating?: number;
  seller_name?: string;
};

export function ProductGrid({
  products,
  qtyFor,
  onAdd,
  onInc,
  onDec,
  ListHeaderComponent,
  ListEmptyComponent,
  refreshControl,
  contentPaddingBottom = 50,
}: {
  products: Product[];
  qtyFor: (id: string) => number;
  onAdd: (p: Product) => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  refreshControl?: any;
  contentPaddingBottom?: number;
}) {
  return (
    <FlatList
      data={products}
      keyExtractor={(p) => p.id}
      numColumns={2}
      ListHeaderComponent={ListHeaderComponent ?? null}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          qty={qtyFor(item.id)}
          onAdd={() => onAdd(item)}
          onInc={() => onInc(item.id)}
          onDec={() => onDec(item.id)}
        />
      )}
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
      contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
      ListEmptyComponent={ListEmptyComponent ?? <View />}
    />
  );
}
