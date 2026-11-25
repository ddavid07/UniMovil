import { useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../features/account/AuthProvider';
import { colors } from '../shared/theme';

export default function ResetPasswordScreen() {
  const { updatePassword } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = fragment.get('access_token');
    const recoveryType = fragment.get('type');
    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    );
    if (recoveryType === 'recovery' && token) setAccessToken(token);
    else
      setError('El enlace de recuperación no es válido o ha caducado. Solicita otro.');
  }, []);

  async function submit(): Promise<void> {
    setError('');
    setNotice('');
    if (password.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setBusy(true);
    try {
      await updatePassword(accessToken, password);
      setNotice('La contraseña se ha actualizado. Ya puedes iniciar sesión.');
      setPassword('');
      setConfirmation('');
      setTimeout(() => router.replace('/account'), 900);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo actualizar la contraseña.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>
          Restablecer contraseña
        </Text>
        <Text style={styles.copy}>
          Elige una contraseña nueva de al menos 12 caracteres.
        </Text>
        <TextInput
          accessibilityLabel="Nueva contraseña"
          autoComplete="new-password"
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          value={password}
        />
        <TextInput
          accessibilityLabel="Confirmar nueva contraseña"
          autoComplete="new-password"
          onChangeText={setConfirmation}
          secureTextEntry
          style={styles.input}
          value={confirmation}
        />
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        {notice ? (
          <Text accessibilityLiveRegion="polite" style={styles.notice}>
            {notice}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={busy || (Platform.OS === 'web' && !accessToken)}
          onPress={() => void submit()}
          style={[
            styles.button,
            (busy || (Platform.OS === 'web' && !accessToken)) && styles.disabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {busy ? 'Guardando…' : 'Actualizar contraseña'}
          </Text>
        </Pressable>
        <Link href="/account" style={styles.link}>
          Volver a la cuenta
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.canvas,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    gap: 14,
    padding: 24,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  title: { color: colors.ink, fontSize: 24, fontWeight: '700' },
  copy: { color: colors.muted, lineHeight: 22 },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    color: colors.ink,
  },
  error: { color: colors.error },
  notice: { color: colors.success },
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.universityRed,
  },
  disabled: { opacity: 0.55 },
  buttonText: { color: colors.surface, fontWeight: '700' },
  link: { color: colors.universityRed, textAlign: 'center' },
});
