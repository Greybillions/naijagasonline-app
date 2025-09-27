import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  search: string;
  setSearch: (s: string) => void;
  onFocus?: () => void;
  searching?: boolean;
  placesKeyMissing?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  /** minimum chars before we show manual add + run suggestions */
  minChars: number;
  /** Suggestions dropdown (map results) is provided by the parent */
  children?: React.ReactNode;
  onClear?: () => void;

  /** Allow adding the raw typed text as a saved address */
  onAddTyped?: (label: string) => Promise<boolean> | boolean;
};

export function SearchBox({
  search,
  setSearch,
  onFocus,
  searching,
  placesKeyMissing,
  inputRef,
  minChars,
  children,
  onClear,
  onAddTyped,
}: Props) {
  const submitting = useRef(false);

  async function addTyped() {
    const label = search.trim();
    if (!label || label.length < minChars) return;
    if (submitting.current) return;
    submitting.current = true;

    let ok = true;
    if (onAddTyped) {
      try {
        const res = await onAddTyped(label);
        ok = res !== false;
      } catch {
        ok = false;
      }
    }

    if (ok) {
      // UX: small “added” popup
      if (Platform.OS === 'android') {
        ToastAndroid.show('Address added', ToastAndroid.SHORT);
      } else {
        Alert.alert('Address added');
      }
      setSearch('');
      onClear?.(); // collapse any suggestions the parent may show
    }

    submitting.current = false;
  }

  const canShowManualAdd = search.trim().length >= minChars;

  return (
    <View className='relative my-2'>
      <View className='bg-white/95 rounded-2xl'>
        {/* INPUT ROW */}
        <View className='flex-row items-center px-4 py-3'>
          <Ionicons name='search' size={18} color='#6b7280' />
          <TextInput
            ref={inputRef}
            placeholder={`Add New Address... (min ${minChars} characters)`}
            value={search}
            onChangeText={setSearch}
            onFocus={onFocus}
            className='flex-1 ml-3 text-base'
            placeholderTextColor='#9ca3af'
            autoCapitalize='words'
            autoCorrect={false}
            returnKeyType='done'
            onSubmitEditing={addTyped}
          />
          {searching ? (
            <Text className='text-xs text-emerald-600 font-medium'>
              Searching...
            </Text>
          ) : null}
          {search.length > 0 && (
            <Pressable onPress={onClear} className='ml-2 p-1' hitSlop={8}>
              <Ionicons name='close-circle' size={18} color='#9ca3af' />
            </Pressable>
          )}
        </View>

        {/* ANDROID KEY WARNING */}
        {placesKeyMissing && Platform.OS === 'android' && (
          <View className='px-4 py-2 bg-amber-50 border-t border-amber-100'>
            <Text className='text-amber-800 text-xs'>
              Set EXPO_PUBLIC_GOOGLE_PLACES_KEY in your .env to enable search
              suggestions on Android.
            </Text>
          </View>
        )}

        {/* MANUAL TYPED ADDRESS ROW (no icon) */}
        {canShowManualAdd && (
          <Pressable
            onPress={addTyped}
            className='px-4 py-3 border-t border-neutral-200 active:bg-neutral-50'
            android_ripple={{ color: '#f3f4f6' }}
          >
            <Text className='text-neutral-900 font-medium' numberOfLines={1}>
              Add &quot;{search.trim()}&quot;
            </Text>
            <Text className='text-neutral-500 text-xs mt-1'>
              Save this exact text as your address
            </Text>
          </Pressable>
        )}

        {/* MAP SUGGESTIONS (parent renders them, with a map-pin icon per item) */}
        {children}
      </View>
    </View>
  );
}
