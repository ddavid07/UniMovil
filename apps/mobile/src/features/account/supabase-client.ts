import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

let client: SupabaseClient | null = null;

export function getMobileSupabaseClient(): SupabaseClient {
  if (Platform.OS === 'web') throw new Error('Web sessions are managed by the API.');
  if (client) return client;

  const configuredUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!configuredUrl || !anonKey)
    throw new Error('Configura las variables públicas de Supabase local.');
  const url =
    Platform.OS === 'android'
      ? configuredUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
      : configuredUrl;

  const storage = {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
  client = createClient(url, anonKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
  return client;
}
