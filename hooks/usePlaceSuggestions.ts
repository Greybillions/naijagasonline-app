import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { geocodeCrossPlatform } from '@/services/places';
import type { Suggestion } from '@/domain/types';

type Options = {
  minChars?: number;
  debounceMs?: number;
};

export function usePlaceSuggestions(query: string, opts?: Options) {
  const minChars = opts?.minChars ?? 4;
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [placesKeyMissing, setPlacesKeyMissing] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < minChars) {
      setSuggestions([]);
      return;
    }

    let active = true;
    const id = setTimeout(async () => {
      try {
        setSearching(true);
        if (
          Platform.OS === 'android' &&
          !process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY
        ) {
          setPlacesKeyMissing(true);
          setSuggestions([]);
          return;
        }
        setPlacesKeyMissing(false);

        const data = await geocodeCrossPlatform(q);
        if (active) setSuggestions(data);
      } finally {
        setSearching(false);
      }
    }, opts?.debounceMs ?? 350);

    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [query, minChars, opts?.debounceMs]);

  return { suggestions, searching, placesKeyMissing };
}
