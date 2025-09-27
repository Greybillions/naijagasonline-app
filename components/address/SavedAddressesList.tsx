import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type Address = {
  id: string;
  label: string;
  details?: string | null;
  lat: number;
  lng: number;
  isDefault?: boolean;
};

type Props = {
  addresses: Address[];
  filtered: Address[];
  search: string;
  setDefault: (id: string) => void;
  onChoose: (id: string) => void;
  onRemove: (id: string) => void;

  /** OPTIONAL: show an "Add '{search}'" row when user has typed enough */
  minChars?: number; // default 4
  onAddTyped?: (label: string) => void;

  /** OPTIONAL: briefly highlight a row (e.g., the one just added) */
  highlightId?: string;
};

export function SavedAddressesList({
  addresses,
  filtered,
  search,
  setDefault,
  onChoose,
  onRemove,
  minChars = 4,
  onAddTyped,
  highlightId,
}: Props) {
  const canShowAddTyped = !!onAddTyped && search.trim().length >= minChars;

  if (addresses.length === 0 && !canShowAddTyped) {
    return (
      <View className='py-8 items-center'>
        <Text className='text-neutral-400 text-center mt-4 text-base'>
          No saved addresses yet.{'\n'}Search for a location{'\n'}or &quot;Use
          Current Location&quot; to add one.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Text className='text-xs font-semibold text-neutral-500 uppercase tracking-wide my-3'>
        Saved Addresses ({addresses.length})
      </Text>

      {/* Add typed address (plain row, no icon) */}
      {canShowAddTyped && (
        <Pressable
          onPress={() => onAddTyped?.(search.trim())}
          className='flex-row items-start rounded-2xl px-4 py-4 mb-2 border bg-white border-neutral-200 active:bg-neutral-50'
        >
          <View className='flex-1'>
            <Text
              className='text-neutral-900 font-semibold text-base'
              numberOfLines={1}
            >
              Add “{search.trim()}”
            </Text>
            <Text className='text-neutral-500 text-xs mt-1'>
              Save this exact text as your address
            </Text>
          </View>
          <View className='px-3 py-2 rounded-lg bg-emerald-600'>
            <Text className='text-white text-xs font-bold'>ADD</Text>
          </View>
        </Pressable>
      )}

      {/* Saved list */}
      {filtered.map((item) => {
        const isHighlighted = item.id === highlightId;
        return (
          <View
            key={item.id}
            className={[
              'flex-row items-center rounded-2xl px-4 py-4 mb-2 border',
              item.isDefault
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-white border-neutral-200',
              isHighlighted ? 'border-emerald-500' : '',
            ].join(' ')}
          >
            {/* Icon bubble (saved addresses show a home icon) */}
            <View className='w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3'>
              <Ionicons name='home-outline' size={20} color='#059669' />
            </View>

            <Pressable onPress={() => onChoose(item.id)} className='flex-1'>
              <Text className='text-neutral-900 font-semibold text-base'>
                {item.label}
                {item.isDefault && (
                  <Text className='text-emerald-600'> • Default</Text>
                )}
                {isHighlighted && (
                  <Text className='text-emerald-600'> • Added</Text>
                )}
              </Text>
              <Text className='text-neutral-600 text-sm mt-1' numberOfLines={2}>
                {item.details ??
                  `${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`}
              </Text>
            </Pressable>

            <View className='flex-row items-center gap-1'>
              {!item.isDefault && (
                <Pressable
                  onPress={() => setDefault(item.id)}
                  className='px-3 py-2 rounded-lg bg-emerald-100 active:bg-emerald-200'
                >
                  <Text className='text-emerald-800 text-xs font-bold'>
                    DEFAULT
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => onRemove(item.id)}
                className='px-3 py-2 rounded-lg bg-red-100 active:bg-red-200'
              >
                <Text className='text-red-700 text-xs font-bold'>❌</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      {filtered.length === 0 && search.trim() && !canShowAddTyped && (
        <Text className='text-neutral-500 text-center py-4'>
          No addresses match &quot;{search}&quot;
        </Text>
      )}
    </View>
  );
}
