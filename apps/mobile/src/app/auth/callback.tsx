import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getMobileSupabaseClient } from '../../features/account/supabase-client';
import { colors } from '../../shared/theme';

export default function AuthCallbackScreen() {
  const { code, type } = useLocalSearchParams<{ code?: string; type?: string }>();
  const handled = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    let active = true;
    void (async () => {
      try {
        if (Platform.OS !== 'web' && typeof code === 'string') {
          const { error: exchangeError } =
            await getMobileSupabaseClient().auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }
        if (!active) return;
        router.replace(type === 'recovery' ? '/reset-password' : '/account');
      } catch {
        if (active)
          setError('El enlace ya no es válido. Solicita uno nuevo desde tu cuenta.');
      }
    })();
    return () => {
      active = false;
    };
  }, [code, type]);

  return (
    <View
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      {error ? (
        <Text accessibilityRole="alert">{error}</Text>
      ) : (
        <ActivityIndicator color={colors.universityRed} />
      )}
    </View>
  );
}
