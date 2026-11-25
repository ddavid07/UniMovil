import { Link, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from './AuthProvider';
import { localPlacesRepository } from '../campus/data/repository';
import { CATEGORY_LABELS, type Place } from '../campus/domain/places';
import { CAMPUS_TRANSIT } from '../campus/domain/transit';
import { favoriteTypes } from '@unimovil/contracts';
import { colors } from '../../shared/theme';

type FavoriteType = (typeof favoriteTypes)[number];
type FavoriteResource = {
  resourceType: FavoriteType;
  resourceId: string;
  name: string;
  category: string;
};

interface Favorite {
  id: string;
  resourceType: FavoriteType;
  resourceId: string;
}

interface Profile {
  relationship: string | null;
}

const RELATIONSHIPS = [
  { id: null, label: 'Sin indicar' },
  { id: 'student', label: 'Estudiante' },
  { id: 'faculty', label: 'Profesorado' },
  { id: 'staff', label: 'Personal universitario' },
  { id: 'visitor', label: 'Visitante' },
  { id: 'other', label: 'Otra relación' },
] as const;

type FormMode = 'sign-in' | 'sign-up' | 'recovery';

export function AccountScreen() {
  const { user, loading, signUp, signIn, signOut, requestRecovery, request, refresh } =
    useAuth();
  const [mode, setMode] = useState<FormMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [places, setPlaces] = useState<readonly Place[]>([]);
  const [favorites, setFavorites] = useState<readonly Favorite[]>([]);
  const [profile, setProfile] = useState<Profile>({ relationship: null });
  const [search, setSearch] = useState('');
  const [resourceType, setResourceType] = useState<FavoriteType | 'all'>('all');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    void localPlacesRepository.list().then(setPlaces);
  }, []);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setProfile({ relationship: null });
      return;
    }
    let current = true;
    void Promise.all([request('/me'), request('/me/favorites')])
      .then(async ([profileResponse, favoriteResponse]) => {
        const profileResult = (await profileResponse.json()) as Profile;
        const favoriteResult = (await favoriteResponse.json()) as {
          favorites: Favorite[];
        };
        if (!current) return;
        setProfile(profileResult);
        setFavorites(favoriteResult.favorites);
      })
      .catch((cause: unknown) => {
        if (current)
          setError(
            cause instanceof Error
              ? cause.message
              : 'No se cargaron los datos de la cuenta.',
          );
      });
    return () => {
      current = false;
    };
  }, [request, user]);

  const resources = useMemo<readonly FavoriteResource[]>(
    () => [
      ...places.map((place) => ({
        resourceType: 'place' as const,
        resourceId: place.id,
        name: place.name,
        category: CATEGORY_LABELS[place.category],
      })),
      ...CAMPUS_TRANSIT.stops.map((stop) => ({
        resourceType: 'transit-stop' as const,
        resourceId: stop.id,
        name: stop.name,
        category: `Parada EMT ${stop.reference}`,
      })),
      ...CAMPUS_TRANSIT.lines.map((line) => ({
        resourceType: 'transit-line' as const,
        resourceId: line.id,
        name: `${line.reference} · ${line.name}`,
        category: 'Línea EMT',
      })),
    ],
    [places],
  );
  const favoriteKeys = useMemo(
    () =>
      new Set(
        favorites.map((favorite) => `${favorite.resourceType}:${favorite.resourceId}`),
      ),
    [favorites],
  );
  const filteredResources = useMemo(() => {
    const query = search
      .trim()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLocaleLowerCase('es');
    return resources
      .filter(
        (resource) => resourceType === 'all' || resource.resourceType === resourceType,
      )
      .filter(
        (resource) =>
          !query ||
          resource.name
            .normalize('NFD')
            .replace(/\p{M}/gu, '')
            .toLocaleLowerCase('es')
            .includes(query),
      )
      .slice(0, 30);
  }, [resourceType, resources, search]);

  async function submitCredentials(): Promise<void> {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      if (mode === 'sign-up') {
        setNotice(await signUp(email.trim(), password));
      } else if (mode === 'recovery') {
        await requestRecovery(email.trim());
        setNotice(
          'Si la cuenta puede recuperarse, recibirás instrucciones para recuperar el acceso.',
        );
      } else {
        await signIn(email.trim(), password);
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo completar la solicitud.',
      );
    } finally {
      setBusy(false);
    }
  }

  async function toggleFavorite(resource: FavoriteResource): Promise<void> {
    setError('');
    try {
      const favorite = favorites.find(
        (item) =>
          item.resourceType === resource.resourceType &&
          item.resourceId === resource.resourceId,
      );
      if (favorite) {
        await request(`/me/favorites/${favorite.id}`, { method: 'DELETE' });
        setFavorites((current) => current.filter((item) => item.id !== favorite.id));
      } else {
        const response = await request('/me/favorites', {
          method: 'POST',
          body: JSON.stringify({
            resourceType: resource.resourceType,
            resourceId: resource.resourceId,
          }),
        });
        const created = (await response.json()) as Favorite;
        setFavorites((current) => [created, ...current]);
      }
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo actualizar el favorito.',
      );
    }
  }

  async function saveProfile(relationship: string | null): Promise<void> {
    setError('');
    try {
      const response = await request('/me', {
        method: 'PATCH',
        body: JSON.stringify({ relationship }),
      });
      setProfile((await response.json()) as Profile);
      setNotice('El perfil se ha actualizado.');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo guardar el perfil.',
      );
    }
  }

  async function deleteAccount(): Promise<void> {
    setBusy(true);
    setError('');
    try {
      await request('/me', { method: 'DELETE' });
      await signOut().catch(() => undefined);
      await refresh();
      setConfirmDelete(false);
      setNotice('La cuenta y sus datos asociados se han eliminado.');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'No se pudo eliminar la cuenta.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/')}>
          <Text style={styles.backLink}>‹ Volver al campus</Text>
        </Pressable>
        <Link href="/incidents" style={styles.backLink}>
          Incidencias
        </Link>
      </View>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>UNIMOVIL · CUENTA</Text>
        <Text accessibilityRole="header" style={styles.pageTitle}>
          Tu cuenta y favoritos
        </Text>
        <Text style={styles.copy}>
          El mapa, las rutas y la información pública siguen disponibles sin iniciar
          sesión.
        </Text>
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Privacidad y datos
        </Text>
        <Text style={styles.copy}>
          El mapa y la información pública no necesitan cuenta. Si autorizas la
          ubicación, se usa durante la sesión para centrar el mapa y calcular cercanía;
          no se asocia a tu perfil. Las solicitudes de mapa pueden revelar al proveedor
          de teselas el área que consultas.
        </Text>
        <Text style={styles.copy}>
          La cuenta guarda el correo en el proveedor de identidad y, si lo eliges, tu
          relación con la UCM, tus favoritos y las incidencias que envías. Las imágenes
          de incidencias se conservan privadas. Puedes consultar o eliminar los datos de
          tu cuenta desde esta pantalla. Las notificaciones no están activadas.
        </Text>
        {Platform.OS !== 'web' ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              void Linking.openSettings().catch(() =>
                setError('No se pudieron abrir los ajustes del dispositivo.'),
              )
            }
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              Abrir ajustes del dispositivo
            </Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View style={styles.card}>
          <ActivityIndicator color={colors.universityRed} />
          <Text style={styles.copy}>Comprobando sesión…</Text>
        </View>
      ) : !user ? (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            {mode === 'sign-in'
              ? 'Iniciar sesión'
              : mode === 'sign-up'
                ? 'Crear cuenta'
                : 'Recuperar acceso'}
          </Text>
          <Text style={styles.copy}>
            Al crear la cuenta, recibirás un correo para confirmar la dirección. Solo se
            solicitan los datos necesarios para acceder a las funciones de cuenta.
          </Text>
          <TextInput
            accessibilityLabel="Correo electrónico"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            style={styles.input}
            value={email}
          />
          {mode !== 'recovery' && (
            <TextInput
              accessibilityLabel="Contraseña"
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              onChangeText={setPassword}
              placeholder="Contraseña (12 caracteres o más)"
              secureTextEntry
              style={styles.input}
              value={password}
            />
          )}
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void submitCredentials()}
            style={styles.primaryButton}
          >
            {busy ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {mode === 'sign-in'
                  ? 'Iniciar sesión'
                  : mode === 'sign-up'
                    ? 'Crear cuenta'
                    : 'Enviar instrucciones'}
              </Text>
            )}
          </Pressable>
          <View style={styles.linkRow}>
            {mode !== 'sign-in' && (
              <Pressable onPress={() => setMode('sign-in')}>
                <Text style={styles.inlineLink}>Iniciar sesión</Text>
              </Pressable>
            )}
            {mode !== 'sign-up' && (
              <Pressable onPress={() => setMode('sign-up')}>
                <Text style={styles.inlineLink}>Crear cuenta</Text>
              </Pressable>
            )}
            {mode !== 'recovery' && (
              <Pressable onPress={() => setMode('recovery')}>
                <Text style={styles.inlineLink}>Olvidé la contraseña</Text>
              </Pressable>
            )}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.card}>
            <View style={styles.sectionHeading}>
              <View style={{ flex: 1 }}>
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  Sesión iniciada
                </Text>
                <Text style={styles.copy}>{user.email ?? 'Cuenta confirmada'}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  void signOut().catch((cause: unknown) =>
                    setError(
                      cause instanceof Error
                        ? cause.message
                        : 'No se pudo cerrar la sesión.',
                    ),
                  )
                }
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cerrar sesión</Text>
              </Pressable>
            </View>
            <Text style={styles.label}>Relación opcional con la UCM</Text>
            <View style={styles.relationships}>
              {RELATIONSHIPS.map((item) => (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ selected: profile.relationship === item.id }}
                  key={item.label}
                  onPress={() => void saveProfile(item.id)}
                  style={[
                    styles.relationship,
                    profile.relationship === item.id && styles.relationshipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.relationshipText,
                      profile.relationship === item.id &&
                        styles.relationshipTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.explanation}>
              Esta relación no concede permisos adicionales. El email lo gestiona el
              proveedor de identidad.
            </Text>
          </View>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Favoritos
            </Text>
            <Text style={styles.copy}>
              Lugares, paradas y líneas quedan guardados en tu cuenta. Las referencias
              retiradas se conservan y se identifican.
            </Text>
            <View style={styles.linkRow}>
              {(
                [
                  { id: 'all', label: 'Todos' },
                  { id: 'place', label: 'Lugares' },
                  { id: 'transit-stop', label: 'Paradas' },
                  { id: 'transit-line', label: 'Líneas' },
                ] as const
              ).map((item) => (
                <Pressable
                  key={item.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: resourceType === item.id }}
                  onPress={() => setResourceType(item.id)}
                  style={[
                    styles.typeFilter,
                    resourceType === item.id && styles.typeFilterSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeFilterText,
                      resourceType === item.id && styles.typeFilterTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              accessibilityLabel="Buscar lugar, parada o línea"
              onChangeText={setSearch}
              placeholder="Buscar un lugar, parada o línea"
              style={styles.input}
              value={search}
            />
            <View style={styles.favoriteList}>
              {filteredResources.map((resource) => {
                const selected = favoriteKeys.has(
                  `${resource.resourceType}:${resource.resourceId}`,
                );
                return (
                  <View
                    key={`${resource.resourceType}:${resource.resourceId}`}
                    style={styles.favoriteRow}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.favoriteName}>{resource.name}</Text>
                      <Text style={styles.explanation}>{resource.category}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => void toggleFavorite(resource)}
                      style={styles.secondaryButton}
                    >
                      <Text style={styles.secondaryButtonText}>
                        {selected ? 'Quitar' : 'Guardar'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
              {filteredResources.length === 0 && (
                <Text style={styles.copy}>No hay recursos que coincidan.</Text>
              )}
            </View>
            <Text style={styles.label}>Guardados ({favorites.length})</Text>
            {favorites.length === 0 ? (
              <Text style={styles.copy}>Todavía no tienes favoritos.</Text>
            ) : (
              favorites.map((favorite) => {
                const resource = resources.find(
                  (item) =>
                    item.resourceType === favorite.resourceType &&
                    item.resourceId === favorite.resourceId,
                );
                return (
                  <Text key={favorite.id} style={styles.favoriteName}>
                    {resource?.name ?? `Recurso retirado (${favorite.resourceId})`}
                  </Text>
                );
              })
            )}
          </View>

          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Eliminar cuenta
            </Text>
            <Text style={styles.copy}>
              Se eliminarán el perfil, favoritos, sesiones e incidencias privadas con
              sus evidencias.
            </Text>
            {!confirmDelete ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirmDelete(true)}
                style={styles.dangerButton}
              >
                <Text style={styles.dangerButtonText}>Eliminar mi cuenta</Text>
              </Pressable>
            ) : (
              <View style={styles.confirmBox}>
                <Text accessibilityRole="alert" style={styles.copy}>
                  La eliminación es permanente. Confirma para continuar.
                </Text>
                <View style={styles.linkRow}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => void deleteAccount()}
                    style={styles.dangerButton}
                  >
                    <Text style={styles.dangerButtonText}>
                      {busy ? 'Eliminando…' : 'Confirmar eliminación'}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setConfirmDelete(false)}
                    style={styles.secondaryButton}
                  >
                    <Text style={styles.secondaryButtonText}>Cancelar</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </>
      )}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    gap: 14,
    padding: 18,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 42,
  },
  backLink: { color: colors.universityRedDark, fontSize: 13, fontWeight: '700' },
  header: { gap: 6, paddingBottom: 6 },
  eyebrow: {
    color: colors.universityRedDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  pageTitle: { color: colors.ink, fontSize: 25, fontWeight: '800' },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  card: {
    gap: 11,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  input: {
    minHeight: 46,
    paddingHorizontal: 12,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.canvas,
  },
  primaryButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.universityRedDark,
  },
  primaryButtonText: { color: colors.surface, fontWeight: '800' },
  secondaryButton: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F2E3E7',
  },
  secondaryButtonText: {
    color: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '700',
  },
  dangerButton: {
    minHeight: 42,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FCE8EC',
  },
  dangerButtonText: { color: colors.error, fontSize: 12, fontWeight: '800' },
  linkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  inlineLink: {
    color: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  label: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  relationships: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  relationship: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
  },
  relationshipSelected: {
    borderColor: colors.universityRed,
    backgroundColor: '#F2E3E7',
  },
  relationshipText: { color: colors.muted, fontSize: 11 },
  relationshipTextSelected: { color: colors.universityRedDark, fontWeight: '700' },
  explanation: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  favoriteList: { gap: 7 },
  typeFilter: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
  },
  typeFilterSelected: { borderColor: colors.universityRed, backgroundColor: '#F2E3E7' },
  typeFilterText: { color: colors.muted, fontSize: 11 },
  typeFilterTextSelected: { color: colors.universityRedDark, fontWeight: '700' },
  favoriteRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  favoriteName: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  confirmBox: {
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6AAB6',
  },
  error: {
    padding: 12,
    borderRadius: 10,
    color: colors.error,
    backgroundColor: '#FCE8EC',
    fontSize: 13,
  },
  notice: {
    padding: 12,
    borderRadius: 10,
    color: colors.success,
    backgroundColor: '#E8F5EE',
    fontSize: 13,
  },
});
