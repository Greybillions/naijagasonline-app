import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Suggestion } from '@/domain/types';

type Props = {
  suggestions: Suggestion[];
  onPick: (s: Suggestion) => void;
};

export function SuggestionList({ suggestions, onPick }: Props) {
  if (!suggestions.length) return null;

  return (
    <View className='border-t border-neutral-200'>
      {suggestions.map((s, idx) => (
        <Pressable
          key={`${s.lat}-${s.lng}-${idx}`}
          onPress={() => onPick(s)}
          className='flex-row items-center px-4 py-3 border-b border-neutral-100 last:border-b-0 active:bg-neutral-50'
        >
          <View className='w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-3'>
            <Ionicons name='location-outline' size={16} color='#059669' />
          </View>
          <View className='flex-1'>
            <Text
              className='text-neutral-900 font-medium text-sm'
              numberOfLines={1}
            >
              {s.label}
            </Text>
            {!!s.details && (
              <Text className='text-neutral-500 text-xs mt-1' numberOfLines={1}>
                {s.details}
              </Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
