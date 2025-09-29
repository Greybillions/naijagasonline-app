// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Small no-op storage for SSR/build where window is undefined
class NoopStorage {
  getItem(_key: string) {
    return Promise.resolve(null);
  }
  setItem(_key: string, _value: string) {
    return Promise.resolve();
  }
  removeItem(_key: string) {
    return Promise.resolve();
  }
}

const isWeb = Platform.OS === 'web';
const hasWindow = typeof window !== 'undefined';

// On native: use AsyncStorage
// On web runtime: use localStorage
// On SSR/prerender: use NoopStorage (so it won’t touch window)
const storage: any = isWeb
  ? hasWindow
    ? window.localStorage
    : new NoopStorage()
  : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage,
    persistSession: true,
    // Only try to auto-refresh tokens in environments that can run timers
    autoRefreshToken: !isWeb || hasWindow,
    // Only parse the URL in a real browser
    detectSessionInUrl: isWeb && hasWindow,
  },
});
