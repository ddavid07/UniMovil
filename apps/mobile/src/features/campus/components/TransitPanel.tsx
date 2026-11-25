import { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../../../shared/theme';
import {
  getLineStops,
  linesServingStop,
  upcomingDeparturesForStop,
  type TransitDataset,
  type TransitLine,
  type TransitStop,
} from '../domain/transit';

const EMT_PUBLIC_WEBSITE = 'https://www.emtmadrid.es/EMTBUS/Incidencias.aspx';

interface TransitPanelProps {
  dataset: TransitDataset;
  selectedLineId: string | null;
  selectedStopId: string | null;
  onSelectLine: (line: TransitLine) => void;
  onSelectStop: (stop: TransitStop) => void;
  onRouteToStop: (stop: TransitStop) => void;
  now?: Date;
}

export function TransitPanel({
  dataset,
  selectedLineId,
  selectedStopId,
  onSelectLine,
  onSelectStop,
  onRouteToStop,
  now: suppliedNow,
}: TransitPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [clock, setClock] = useState(() => suppliedNow ?? new Date());
  const lines = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es');
    return dataset.lines.filter((line) =>
      `${line.reference} ${line.name} ${line.patterns.map((pattern) => pattern.headsign).join(' ')}`
        .toLocaleLowerCase('es')
        .includes(normalized),
    );
  }, [dataset.lines, query]);
  const selectedLine = dataset.lines.find((line) => line.id === selectedLineId);
  const selectedPattern =
    selectedLine?.patterns.find((pattern) => pattern.id === selectedPatternId) ??
    selectedLine?.patterns[0];
  const selectedStop = dataset.stops.find((stop) => stop.id === selectedStopId);
  const orderedStops =
    selectedLine && selectedPattern
      ? getLineStops(selectedLine, dataset.stops, selectedPattern.id)
      : [];
  const stopLines = selectedStop ? linesServingStop(selectedStop, dataset.lines) : [];
  const departures = selectedStop
    ? upcomingDeparturesForStop(selectedStop.id, clock, dataset).filter((departure) =>
        selectedLineId ? departure.lineId === selectedLineId : true,
      )
    : [];

  useEffect(() => {
    if (suppliedNow || !expanded) {
      if (suppliedNow) setClock(suppliedNow);
      return undefined;
    }
    const interval = setInterval(() => setClock(new Date()), 60_000);
    return () => clearInterval(interval);
  }, [expanded, suppliedNow]);

  useEffect(() => {
    setSelectedPatternId(null);
  }, [selectedLineId]);

  async function openExternal(url: string): Promise<void> {
    try {
      await Linking.openURL(url);
    } catch {
      // Keep the panel usable if the device cannot open the external link.
    }
  }

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.heading}
      >
        <View style={styles.headingCopy}>
          <Text style={styles.title}>Autobuses y paradas</Text>
          <Text style={styles.subtitle}>
            Horarios programados y recorridos del campus
          </Text>
        </View>
        <Text style={styles.expandIcon}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.content}>
          <TextInput
            accessibilityLabel="Buscar línea de autobús"
            onChangeText={setQuery}
            placeholder="Busca por línea o destino"
            style={styles.input}
            value={query}
          />
          <ScrollView
            horizontal
            contentContainerStyle={styles.lines}
            showsHorizontalScrollIndicator={false}
          >
            {lines.map((line) => {
              const direction = line.patterns[0]?.headsign || line.name;
              return (
                <Pressable
                  accessibilityLabel={`${line.reference}: ${direction}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: line.id === selectedLineId }}
                  key={line.id}
                  onPress={() => {
                    setSelectedPatternId(line.patterns[0]?.id ?? null);
                    onSelectLine(line);
                  }}
                  style={[
                    styles.lineButton,
                    line.id === selectedLineId && styles.lineButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.lineRef,
                      line.id === selectedLineId && styles.lineRefSelected,
                    ]}
                  >
                    {line.reference}
                  </Text>
                  <Text numberOfLines={1} style={styles.lineDirection}>
                    {direction}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {!selectedLine ? (
            <Text style={styles.notice}>
              Selecciona una línea para consultar su recorrido, paradas y horarios.
            </Text>
          ) : (
            <View style={styles.detail}>
              <Text accessibilityRole="header" style={styles.detailTitle}>
                Línea {selectedLine.reference}: {selectedLine.name}
              </Text>
              {selectedLine.patterns.length > 1 && (
                <View
                  accessibilityLabel="Sentido del recorrido"
                  style={styles.directions}
                >
                  {selectedLine.patterns.map((pattern) => (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: pattern.id === selectedPattern?.id,
                      }}
                      key={pattern.id}
                      onPress={() => setSelectedPatternId(pattern.id)}
                      style={[
                        styles.directionButton,
                        pattern.id === selectedPattern?.id &&
                          styles.directionButtonSelected,
                      ]}
                    >
                      <Text style={styles.directionText}>
                        {pattern.headsign || `Sentido ${pattern.directionId}`}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <Text style={styles.detailCopy}>
                Recorrido y secuencia de paradas en el sentido{' '}
                {selectedPattern?.headsign || selectedPattern?.directionId}.
              </Text>
              <ScrollView style={styles.stops}>
                {orderedStops.map((stop, index) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: stop.id === selectedStopId }}
                    key={`${index}-${stop.id}`}
                    onPress={() => onSelectStop(stop)}
                    style={[
                      styles.stop,
                      stop.id === selectedStopId && styles.stopSelected,
                    ]}
                  >
                    <Text style={styles.stopNumber}>{index + 1}</Text>
                    <Text style={styles.stopName}>{stop.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <Text style={styles.notice}>
                Horarios estáticos de EMT Madrid, actualización del conjunto:{' '}
                {dataset.source.updatedAt.slice(0, 10)}. No son tiempos de llegada en
                tiempo real.
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() =>
                  void openExternal(selectedLine.url || dataset.source.datasetUrl)
                }
              >
                <Text style={styles.link}>
                  Consultar fuente y condiciones del conjunto
                </Text>
              </Pressable>
            </View>
          )}
          {selectedStop && (
            <View style={styles.stopDetail}>
              <Text accessibilityRole="header" style={styles.detailTitle}>
                {selectedStop.name}
              </Text>
              <Text style={styles.detailCopy}>
                Líneas con parada en este punto:{' '}
                {stopLines.map((line) => line.reference).join(', ') || 'ninguna'}.
              </Text>
              {departures.length > 0 ? (
                <View
                  accessibilityLabel="Próximas salidas programadas"
                  style={styles.departures}
                >
                  <Text style={styles.departureHeading}>
                    Próximas salidas programadas
                  </Text>
                  {departures.map((departure) => (
                    <Text
                      key={`${departure.lineId}-${departure.scheduledTime}-${departure.headsign}`}
                      style={styles.departure}
                    >
                      {departure.lineReference} · {departure.scheduledTime} ·{' '}
                      {departure.minutesUntil === 0
                        ? 'ahora, según horario'
                        : `en ${departure.minutesUntil} min`}{' '}
                      · {departure.headsign}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.notice}>
                  El horario estático no contiene salidas próximas para esta selección.
                  Comprueba el servicio con EMT Madrid.
                </Text>
              )}
              <Text style={styles.notice}>
                La aplicación no consulta incidencias en tiempo real. Verifica avisos
                antes de viajar.
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => void openExternal(EMT_PUBLIC_WEBSITE)}
              >
                <Text style={styles.link}>Consultar avisos de EMT Madrid</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => onRouteToStop(selectedStop)}
                style={styles.routeButton}
              >
                <Text style={styles.routeButtonText}>Crear ruta a esta parada</Text>
              </Pressable>
            </View>
          )}
          <Text style={styles.attribution}>
            Datos: EMT Madrid · licencia {dataset.source.license} · conjunto comprobado
            el {dataset.source.checkedAt}. Geometría y recorte del campus:{' '}
            {dataset.source.campusBoundaryLicense}.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  headingCopy: { flex: 1, gap: 2 },
  title: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 11 },
  expandIcon: { color: colors.universityRedDark, fontSize: 24, fontWeight: '700' },
  content: { gap: 9, paddingHorizontal: 12, paddingBottom: 12 },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: colors.ink,
    backgroundColor: colors.canvas,
  },
  lines: { gap: 7, paddingVertical: 2 },
  lineButton: {
    width: 175,
    minHeight: 56,
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
  },
  lineButtonSelected: { borderColor: colors.universityRed, backgroundColor: '#F2E3E7' },
  lineRef: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  lineRefSelected: { color: colors.universityRedDark },
  lineDirection: { color: colors.muted, fontSize: 10 },
  detail: { gap: 6 },
  detailTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  detailCopy: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  directions: { gap: 6 },
  directionButton: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  directionButtonSelected: {
    borderColor: colors.universityRed,
    backgroundColor: '#F2E3E7',
  },
  directionText: { color: colors.ink, fontSize: 11 },
  stops: { maxHeight: 170, borderRadius: 9, backgroundColor: colors.canvas },
  stop: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  stopSelected: { backgroundColor: '#E7EDF9' },
  stopNumber: {
    width: 20,
    color: colors.universityRedDark,
    fontSize: 11,
    fontWeight: '800',
  },
  stopName: { flex: 1, color: colors.ink, fontSize: 11 },
  stopDetail: { gap: 6, padding: 9, borderRadius: 10, backgroundColor: colors.canvas },
  departures: { gap: 4, paddingVertical: 4 },
  departureHeading: { color: colors.ink, fontSize: 11, fontWeight: '700' },
  departure: { color: colors.ink, fontSize: 11, lineHeight: 16 },
  routeButton: {
    minHeight: 40,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F2E3E7',
  },
  routeButtonText: { color: colors.universityRedDark, fontSize: 11, fontWeight: '800' },
  notice: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  link: {
    color: colors.universityRedDark,
    fontSize: 11,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  attribution: { color: colors.muted, fontSize: 9, lineHeight: 13 },
});
