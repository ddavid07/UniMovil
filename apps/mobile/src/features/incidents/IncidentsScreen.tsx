import * as ImagePicker from 'expo-image-picker';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  campusCoordinatesSchema,
  incidentCategories,
  incidentPriorities,
  type IncidentCategory,
  type IncidentPriority,
  type IncidentStatus,
  type PublicIncident,
} from '@unimovil/contracts';
import { useAuth } from '../account/AuthProvider';
import { API_BASE_URL } from '../account/api-config';
import { localPlacesRepository } from '../campus/data/repository';
import { createSearchIndex, searchPlaces, type Place } from '../campus/domain/places';
import { colors } from '../../shared/theme';
import { INCIDENT_CATEGORY_LABELS, INCIDENT_STATUS_LABELS, localDate } from './labels';
import { isWithinIncidentZone } from './domain/incident-zone';
import { ConfirmationForm, OwnIncidentDetail } from './IncidentFollowUp';

const CATEGORY_OPTIONS: readonly IncidentCategory[] = incidentCategories;
const PRIORITY_OPTIONS: readonly IncidentPriority[] = incidentPriorities;

interface OwnIncident {
  id: string;
  publicId: string;
  category: IncidentCategory;
  description: string;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
}

interface SelectedPhoto {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
  file?: Blob;
}

function newIdempotencyKey(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function')
    return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export function IncidentsScreen() {
  const { user, request } = useAuth();
  return (
    <IncidentContent key={user?.id ?? 'anonymous'} user={user} request={request} />
  );
}

function IncidentContent({
  user,
  request,
}: Pick<ReturnType<typeof useAuth>, 'user' | 'request'>) {
  const { incidentId } = useLocalSearchParams<{ incidentId?: string }>();
  const [feed, setFeed] = useState<readonly PublicIncident[]>([]);
  const [ownIncidents, setOwnIncidents] = useState<readonly OwnIncident[]>([]);
  const [ownListState, setOwnListState] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [places, setPlaces] = useState<readonly Place[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'all'>('all');
  const [zoneSearch, setZoneSearch] = useState('');
  const [zonePlace, setZonePlace] = useState<Place | null>(null);
  const [zoneRadius, setZoneRadius] = useState(500);
  const [category, setCategory] = useState<IncidentCategory>('access_obstruction');
  const [priority, setPriority] = useState<IncidentPriority | ''>('');
  const [description, setDescription] = useState('');
  const [placeSearch, setPlaceSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [photos, setPhotos] = useState<readonly SelectedPhoto[]>([]);
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const searchIndex = useMemo(() => createSearchIndex(places), [places]);
  const suggestions = showSuggestions
    ? searchPlaces(searchIndex, placeSearch).slice(0, 6)
    : [];
  const zoneSuggestions =
    zoneSearch.trim().length >= 2
      ? searchPlaces(searchIndex, zoneSearch).slice(0, 6)
      : [];
  const visibleFeed = zonePlace
    ? feed.filter((incident) =>
        isWithinIncidentZone(incident, zonePlace.coordinates, zoneRadius),
      )
    : feed;

  const loadFeed = useCallback(async (): Promise<void> => {
    setLoadingFeed(true);
    try {
      const query = new URLSearchParams();
      if (categoryFilter !== 'all') query.set('category', categoryFilter);
      if (statusFilter !== 'all') query.set('status', statusFilter);
      const suffix = query.size > 0 ? `?${query.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}/incidents${suffix}`);
      if (!response.ok) throw new Error('No se pudo cargar la consulta pública.');
      const result = (await response.json()) as { incidents: PublicIncident[] };
      setFeed(result.incidents);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo cargar la consulta pública.',
      );
      setFeed([]);
    } finally {
      setLoadingFeed(false);
    }
  }, [categoryFilter, statusFilter]);

  const loadOwnIncidents = useCallback(async (): Promise<void> => {
    if (!user) return;
    setOwnListState('loading');
    try {
      const response = await request('/me/incidents');
      const result = (await response.json()) as { incidents: OwnIncident[] };
      setOwnIncidents(result.incidents);
      setOwnListState('ready');
    } catch {
      setOwnListState('error');
    }
  }, [request, user]);

  const updateOwnStatus = useCallback((id: string, status: IncidentStatus) => {
    setOwnIncidents((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }, []);

  useEffect(() => {
    void localPlacesRepository.list().then(setPlaces);
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    void loadOwnIncidents();
  }, [loadOwnIncidents]);

  async function choosePhotos(): Promise<void> {
    setError('');
    const selection = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.9,
    });
    if (selection.canceled) return;
    if (selection.assets.length > 3) {
      setError('Puedes adjuntar hasta tres imágenes.');
      return;
    }
    const nextPhotos: SelectedPhoto[] = selection.assets.map((asset) => {
      const file = asset as ImagePicker.ImagePickerAsset & { file?: Blob };
      return {
        uri: file.uri,
        name: file.fileName ?? 'evidence-image',
        mimeType: file.mimeType ?? 'application/octet-stream',
        size: file.fileSize ?? 0,
        file: file.file,
      };
    });
    const invalid = nextPhotos.find(
      (photo) =>
        !['image/jpeg', 'image/png', 'image/webp'].includes(photo.mimeType) ||
        photo.size > 5 * 1024 * 1024,
    );
    if (invalid) {
      setError('Cada imagen debe ser JPEG, PNG o WebP y ocupar como máximo 5 MiB.');
      return;
    }
    setPhotos(nextPhotos);
  }

  async function submitIncident(): Promise<void> {
    setError('');
    setNotice('');
    const parsedCoordinates = campusCoordinatesSchema.safeParse({
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
    if (!parsedCoordinates.success) {
      setError('Elige un lugar del campus y confirma sus coordenadas.');
      return;
    }
    if (description.trim().length < 1 || description.trim().length > 2000) {
      setError('La descripción debe contener entre 1 y 2.000 caracteres.');
      return;
    }
    if (photos.length > 3) {
      setError('Puedes adjuntar hasta tres imágenes.');
      return;
    }

    setBusy(true);
    const key = idempotencyKey || newIdempotencyKey();
    setIdempotencyKey(key);
    try {
      const form = new FormData();
      form.append('category', category);
      form.append('description', description.trim());
      if (priority) form.append('perceivedPriority', priority);
      form.append('coordinates', JSON.stringify(parsedCoordinates.data));
      for (const photo of photos) {
        if (Platform.OS === 'web') {
          let file = photo.file;
          if (!file) file = await fetch(photo.uri).then((response) => response.blob());
          if (!file)
            throw new Error('No se pudo leer una de las imágenes seleccionadas.');
          form.append('files', file, photo.name);
        } else {
          form.append('files', {
            uri: photo.uri,
            name: photo.name,
            type: photo.mimeType,
          } as unknown as Blob);
        }
      }
      const response = await request('/incidents', {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
        body: form,
      });
      const result = (await response.json()) as {
        publicId: string;
        status: IncidentStatus;
      };
      setNotice(
        `Incidencia ${result.publicId} recibida. Estado: ${INCIDENT_STATUS_LABELS[result.status]}. Se mantiene privada mientras se revisa.`,
      );
      setDescription('');
      setPlaceSearch('');
      setLatitude('');
      setLongitude('');
      setPriority('');
      setPhotos([]);
      setIdempotencyKey('');
      await loadOwnIncidents();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'No se pudo enviar la incidencia. Puedes reintentar.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="link" onPress={() => router.replace('/')}>
          <Text style={styles.link}>‹ Volver al campus</Text>
        </Pressable>
        <Link href="/account" style={styles.link}>
          Cuenta y favoritos
        </Link>
      </View>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>UNIMOVIL · CAMPUS DE MONCLOA</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Incidencias de movilidad
        </Text>
        <Text style={styles.body}>
          El listado público contiene únicamente incidencias revisadas y publicadas. Las
          comunicaciones nuevas son privadas y no aparecen automáticamente.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeading}>
          <View style={{ flex: 1 }}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Incidencias públicas
            </Text>
            <Text style={styles.body}>
              La ubicación se muestra aproximada y no identifica a quien informó.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadFeed()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Actualizar</Text>
          </Pressable>
        </View>
        <ScrollView horizontal contentContainerStyle={styles.filterRow}>
          <FilterButton
            label="Todas"
            selected={categoryFilter === 'all'}
            onPress={() => setCategoryFilter('all')}
          />
          {CATEGORY_OPTIONS.map((item) => (
            <FilterButton
              key={item}
              label={INCIDENT_CATEGORY_LABELS[item]}
              selected={categoryFilter === item}
              onPress={() => setCategoryFilter(item)}
            />
          ))}
        </ScrollView>
        <Text style={styles.label}>Estado</Text>
        <ScrollView horizontal contentContainerStyle={styles.filterRow}>
          <FilterButton
            label="Cualquier estado"
            selected={statusFilter === 'all'}
            onPress={() => setStatusFilter('all')}
          />
          {(['received', 'under_review', 'in_progress'] as const).map((item) => (
            <FilterButton
              key={item}
              label={INCIDENT_STATUS_LABELS[item]}
              selected={statusFilter === item}
              onPress={() => setStatusFilter(item)}
            />
          ))}
        </ScrollView>
        <Text style={styles.label}>Zona aproximada</Text>
        <Text style={styles.meta}>
          Elige un lugar del campus y un radio aproximado desde su punto de referencia.
        </Text>
        <TextInput
          accessibilityLabel="Buscar lugar para filtrar incidencias por zona"
          onChangeText={setZoneSearch}
          placeholder="Todo el campus"
          style={styles.input}
          value={zoneSearch}
        />
        {zoneSuggestions.length > 0 && (
          <View style={styles.suggestions}>
            {zoneSuggestions.map((place) => (
              <Pressable
                accessibilityRole="button"
                key={place.id}
                onPress={() => {
                  setZonePlace(place);
                  setZoneSearch(place.name);
                }}
                style={styles.suggestion}
              >
                <Text style={styles.body}>{place.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
        {zonePlace ? (
          <View style={styles.sectionHeading}>
            <Text style={styles.meta}>Centro: {zonePlace.name}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setZonePlace(null);
                setZoneSearch('');
              }}
            >
              <Text style={styles.link}>Quitar zona</Text>
            </Pressable>
          </View>
        ) : null}
        {zonePlace ? (
          <ScrollView horizontal contentContainerStyle={styles.filterRow}>
            {[250, 500, 1000].map((radius) => (
              <FilterButton
                key={radius}
                label={`${radius} m`}
                selected={zoneRadius === radius}
                onPress={() => setZoneRadius(radius)}
              />
            ))}
          </ScrollView>
        ) : null}
        {loadingFeed ? (
          <ActivityIndicator color={colors.universityRed} />
        ) : visibleFeed.length === 0 ? (
          <Text style={styles.body}>
            No hay incidencias publicadas en esta categoría.
          </Text>
        ) : (
          <View style={styles.incidentList}>
            {visibleFeed.map((incident) => (
              <View
                key={incident.publicId}
                style={[
                  styles.incident,
                  incident.publicId === incidentId && styles.incidentSelected,
                ]}
              >
                <View style={styles.sectionHeading}>
                  <Text style={styles.category}>
                    {INCIDENT_CATEGORY_LABELS[incident.category]}
                  </Text>
                  <Text style={styles.status}>
                    {INCIDENT_STATUS_LABELS[incident.status]}
                  </Text>
                </View>
                <Text style={styles.body}>{incident.description}</Text>
                <Text style={styles.meta}>
                  Actualizada {localDate(incident.updatedAt)} · ubicación aproximada{' '}
                  {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                </Text>
                <Pressable accessibilityRole="link" onPress={() => router.replace('/')}>
                  <Text style={styles.link}>Ver mapa del campus</Text>
                </Pressable>
                {user ? (
                  <ConfirmationForm
                    path={`/incidents/${encodeURIComponent(incident.publicId)}`}
                    status={incident.status}
                    request={request}
                  />
                ) : (
                  <Link href="/account" style={styles.link}>
                    Inicia sesión para confirmar esta incidencia
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}
      </View>

      {user ? (
        <>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Comunicar una incidencia
            </Text>
            <Text style={styles.body}>
              La cuenta permite consultar el seguimiento. La ubicación se elige
              manualmente; no usamos la ubicación del dispositivo en este formulario.
            </Text>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.optionRow}>
              {CATEGORY_OPTIONS.map((item) => (
                <FilterButton
                  key={item}
                  label={INCIDENT_CATEGORY_LABELS[item]}
                  selected={category === item}
                  onPress={() => setCategory(item)}
                />
              ))}
            </View>
            <TextInput
              accessibilityLabel="Buscar lugar para ubicar la incidencia"
              onChangeText={(value) => {
                setPlaceSearch(value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Elige un lugar del campus"
              style={styles.input}
              value={placeSearch}
            />
            {suggestions.length > 0 && (
              <View style={styles.suggestions}>
                {suggestions.map((place) => (
                  <Pressable
                    accessibilityRole="button"
                    key={place.id}
                    onPress={() => {
                      setPlaceSearch(place.name);
                      setLatitude(String(place.coordinates.latitude));
                      setLongitude(String(place.coordinates.longitude));
                      setShowSuggestions(false);
                    }}
                    style={styles.suggestion}
                  >
                    <Text style={styles.body}>{place.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View style={styles.coordinateRow}>
              <TextInput
                accessibilityLabel="Latitud de la incidencia"
                keyboardType="decimal-pad"
                onChangeText={setLatitude}
                placeholder="Latitud"
                style={[styles.input, styles.coordinateInput]}
                value={latitude}
              />
              <TextInput
                accessibilityLabel="Longitud de la incidencia"
                keyboardType="decimal-pad"
                onChangeText={setLongitude}
                placeholder="Longitud"
                style={[styles.input, styles.coordinateInput]}
                value={longitude}
              />
            </View>
            <Text style={styles.meta}>
              Puedes corregir las coordenadas del lugar. Se comprueban dentro de la
              cobertura cartográfica aproximada del campus; no es un linde oficial.
            </Text>
            <TextInput
              accessibilityLabel="Descripción de la incidencia"
              multiline
              onChangeText={setDescription}
              placeholder="Describe el problema (1–2.000 caracteres)"
              style={[styles.input, styles.descriptionInput]}
              textAlignVertical="top"
              value={description}
            />
            <Text style={styles.label}>Prioridad percibida, opcional</Text>
            <View style={styles.optionRow}>
              <FilterButton
                label="Sin indicar"
                selected={!priority}
                onPress={() => setPriority('')}
              />
              {PRIORITY_OPTIONS.map((item) => (
                <FilterButton
                  key={item}
                  label={
                    item === 'low' ? 'Baja' : item === 'normal' ? 'Normal' : 'Alta'
                  }
                  selected={priority === item}
                  onPress={() => setPriority(item)}
                />
              ))}
            </View>
            <View style={styles.sectionHeading}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Fotografías (opcional)</Text>
                <Text style={styles.meta}>
                  JPEG, PNG o WebP · hasta 3 imágenes · máximo 5 MiB cada una
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                disabled={busy}
                onPress={() => void choosePhotos()}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Elegir imágenes</Text>
              </Pressable>
            </View>
            {photos.length > 0 && (
              <View style={styles.photoRow}>
                {photos.map((photo, index) => (
                  <View key={`${photo.uri}-${index}`} style={styles.photoItem}>
                    <Image
                      accessibilityLabel={`Vista previa de imagen ${index + 1}`}
                      source={{ uri: photo.uri }}
                      style={styles.preview}
                    />
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        setPhotos((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <Text style={styles.removePhoto}>Quitar</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void submitIncident()}
              style={[styles.primaryButton, busy && styles.disabled]}
            >
              {busy ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.primaryButtonText}>Enviar incidencia privada</Text>
              )}
            </Pressable>
          </View>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              Mis incidencias
            </Text>
            {ownListState === 'loading' ? (
              <Text accessibilityLiveRegion="polite">Cargando tus incidencias…</Text>
            ) : ownListState === 'error' ? (
              <View>
                <Text accessibilityRole="alert">
                  No se han podido cargar tus incidencias.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadOwnIncidents()}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Reintentar la consulta</Text>
                </Pressable>
              </View>
            ) : ownIncidents.length === 0 ? (
              <Text style={styles.body}>Todavía no has enviado incidencias.</Text>
            ) : (
              ownIncidents.map((incident) => (
                <View key={incident.id} style={styles.incident}>
                  <View style={styles.sectionHeading}>
                    <Text style={styles.category}>
                      {INCIDENT_CATEGORY_LABELS[incident.category]}
                    </Text>
                    <Text style={styles.status}>
                      {INCIDENT_STATUS_LABELS[incident.status]}
                    </Text>
                  </View>
                  <Text style={styles.body}>{incident.description}</Text>
                  <Text style={styles.meta}>
                    Recibida {localDate(incident.createdAt)} · ubicación{' '}
                    {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)} ·
                    referencia {incident.publicId}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: expandedId === incident.id }}
                    accessibilityLabel={`${expandedId === incident.id ? 'Ocultar' : 'Ver'} detalle de ${incident.publicId}`}
                    style={styles.secondaryButton}
                    onPress={() =>
                      setExpandedId((current) =>
                        current === incident.id ? null : incident.id,
                      )
                    }
                  >
                    <Text style={styles.secondaryButtonText}>
                      {expandedId === incident.id ? 'Ocultar detalle' : 'Ver detalle'}
                    </Text>
                  </Pressable>
                  {expandedId === incident.id && (
                    <OwnIncidentDetail
                      incidentId={incident.id}
                      request={request}
                      onStatus={updateOwnStatus}
                    />
                  )}
                </View>
              ))
            )}
          </View>
        </>
      ) : (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            ¿Necesitas comunicar una incidencia?
          </Text>
          <Text style={styles.body}>
            Inicia sesión para enviar una comunicación privada y consultar su
            seguimiento.
          </Text>
          <Link href="/account" asChild>
            <Pressable accessibilityRole="button" style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Ir a la cuenta</Text>
            </Pressable>
          </Link>
        </View>
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

function FilterButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.filter, selected && styles.filterSelected]}
    >
      <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    gap: 14,
    padding: 18,
    paddingBottom: 60,
  },
  topBar: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: { gap: 6, paddingBottom: 5 },
  eyebrow: {
    color: colors.universityRedDark,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: { color: colors.ink, fontSize: 25, fontWeight: '800' },
  body: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  link: {
    color: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  card: {
    gap: 11,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  filter: {
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
  },
  filterSelected: { borderColor: colors.universityRed, backgroundColor: '#F2E3E7' },
  filterText: { color: colors.muted, fontSize: 11 },
  filterTextSelected: { color: colors.universityRedDark, fontWeight: '700' },
  incidentList: { gap: 8 },
  incident: { gap: 8, padding: 12, borderRadius: 12, backgroundColor: colors.canvas },
  incidentSelected: { borderWidth: 2, borderColor: colors.universityRed },
  category: { flex: 1, color: colors.ink, fontSize: 13, fontWeight: '800' },
  status: { color: colors.universityRedDark, fontSize: 11, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 10, lineHeight: 15 },
  secondaryButton: {
    minHeight: 38,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F2E3E7',
  },
  secondaryButtonText: {
    color: colors.universityRedDark,
    fontSize: 11,
    fontWeight: '700',
  },
  label: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  input: {
    minHeight: 44,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    color: colors.ink,
    backgroundColor: colors.canvas,
  },
  suggestions: {
    maxHeight: 220,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  suggestion: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  coordinateRow: { flexDirection: 'row', gap: 8 },
  coordinateInput: { flex: 1, minWidth: 0 },
  descriptionInput: { minHeight: 110, paddingTop: 10 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoItem: { alignItems: 'center', gap: 4 },
  preview: { width: 76, height: 76, borderRadius: 10, backgroundColor: colors.canvas },
  removePhoto: { color: colors.error, fontSize: 11, fontWeight: '700' },
  primaryButton: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.universityRedDark,
  },
  primaryButtonText: { color: colors.surface, fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.65 },
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
    lineHeight: 19,
  },
});
