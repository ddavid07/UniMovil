import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { API_BASE_URL } from './api-config';
import { getMobileSupabaseClient } from './supabase-client';

export interface SessionUser {
  id: string;
  email: string | null;
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  signUp(email: string, password: string): Promise<string>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  requestRecovery(email: string): Promise<void>;
  updatePassword(accessToken: string | null, password: string): Promise<void>;
  request(path: string, init?: RequestInit): Promise<Response>;
  refresh(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export { API_BASE_URL };

function userFromSession(session: Session | null): SessionUser | null {
  if (!session) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

async function readError(response: Response): Promise<string> {
  const result = (await response.json().catch(() => ({}))) as {
    message?: string | readonly string[];
  };
  if (typeof result.message === 'string') return result.message;
  if (Array.isArray(result.message)) return Array.from(result.message).join(' ');
  return 'No se pudo completar la solicitud.';
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/session`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('No se pudo recuperar la sesión.');
        const result = (await response.json()) as { user: SessionUser | null };
        setUser(result.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
      return;
    }

    const { data, error } = await getMobileSupabaseClient().auth.getSession();
    if (error) {
      setUser(null);
    } else {
      setUser(userFromSession(data.session));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      void refresh();
      return undefined;
    }
    let client;
    try {
      client = getMobileSupabaseClient();
    } catch {
      setLoading(false);
      return undefined;
    }
    void client.auth.getSession().then(({ data }) => {
      setUser(userFromSession(data.session));
      setLoading(false);
    });
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      setUser(userFromSession(session));
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (Platform.OS !== 'web') {
      const { data } = await getMobileSupabaseClient().auth.getSession();
      if (!data.session) throw new Error('Inicia sesión para continuar.');
      headers.set('Authorization', `Bearer ${data.session.access_token}`);
    }
    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
      credentials: Platform.OS === 'web' ? 'include' : 'omit',
    });
    if (!response.ok) throw new Error(await readError(response));
    return response;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string): Promise<string> => {
      if (Platform.OS === 'web') {
        const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error(await readError(response));
        const result = (await response.json()) as { message: string };
        return result.message;
      }
      const { data, error } = await getMobileSupabaseClient().auth.signUp({
        email,
        password,
        options: { emailRedirectTo: 'unimovil:///auth/callback' },
      });
      if (error)
        throw new Error(
          'No se pudo crear la cuenta. Revisa el correo y la contraseña.',
        );
      return data.session
        ? 'La cuenta se ha creado y ya puedes continuar.'
        : 'Cuenta creada. Sigue las instrucciones enviadas a tu correo para confirmarla antes de iniciar sesión.';
    },
    [],
  );

  const signIn = useCallback(async (email: string, password: string) => {
    if (Platform.OS === 'web') {
      const response = await fetch(`${API_BASE_URL}/auth/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const result = (await response.json()) as { user: SessionUser };
      setUser(result.user);
      return;
    }
    const { data, error } = await getMobileSupabaseClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session)
      throw new Error(
        'No se pudo iniciar sesión. Revisa tus datos y confirma el correo.',
      );
    setUser(userFromSession(data.session));
  }, []);

  const signOut = useCallback(async () => {
    if (Platform.OS === 'web') {
      const response = await fetch(`${API_BASE_URL}/auth/sign-out`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('No se pudo cerrar la sesión.');
    } else {
      const { error } = await getMobileSupabaseClient().auth.signOut();
      if (error) throw new Error('No se pudo cerrar la sesión segura.');
    }
    setUser(null);
  }, []);

  const requestRecovery = useCallback(async (email: string) => {
    if (Platform.OS === 'web') {
      const response = await fetch(`${API_BASE_URL}/auth/recovery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error(await readError(response));
      return;
    }
    const { error } = await getMobileSupabaseClient().auth.resetPasswordForEmail(
      email,
      {
        redirectTo: 'unimovil:///auth/callback',
      },
    );
    if (error)
      throw new Error('No se pudo solicitar la recuperación. Inténtalo de nuevo.');
  }, []);

  const updatePassword = useCallback(
    async (accessToken: string | null, password: string) => {
      if (Platform.OS === 'web') {
        if (!accessToken)
          throw new Error('Abre el enlace de recuperación para continuar.');
        const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessToken, password }),
        });
        if (!response.ok) throw new Error(await readError(response));
        return;
      }
      const { error } = await getMobileSupabaseClient().auth.updateUser({ password });
      if (error)
        throw new Error(
          'No se pudo actualizar la contraseña. Solicita un enlace nuevo.',
        );
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signUp,
      signIn,
      signOut,
      requestRecovery,
      updatePassword,
      request,
      refresh,
    }),
    [
      user,
      loading,
      signUp,
      signIn,
      signOut,
      requestRecovery,
      updatePassword,
      request,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider.');
  return value;
}
