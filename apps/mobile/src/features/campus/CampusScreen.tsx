import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Action } from "./components/Action";
import { ExplorerControls } from "./components/ExplorerControls";
import { CampusDialogs } from "./components/CampusDialogs";
import { SearchSuggestions } from "./components/SearchSuggestions";
import { CampusMap } from "./map/CampusMap";
import { mapMode } from "./map/map-style";
import { useCampus } from "./useCampus";
import type { PlacesRepository } from "./data/repository";
interface Props {
  repository?: PlacesRepository;
}
export function CampusScreen({ repository }: Props) {
  const campus = useCampus(repository);
  const [listOpen, setListOpen] = useState(false);
  function select(id: string) {
    Keyboard.dismiss();
    setListOpen(false);
    campus.select(id);
  }
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text accessibilityRole="header" style={styles.title}>
          UniMovil · Moncloa
        </Text>
        <ExplorerControls
          query={campus.query}
          categories={campus.categories}
          onQuery={campus.setQuery}
          onToggle={campus.toggleCategory}
          onReset={campus.reset}
        />
        {campus.catalog.status === "loading" && (
          <View style={styles.message}>
            <ActivityIndicator accessibilityLabel="Cargando lugares" />
            <Text>Cargando lugares…</Text>
          </View>
        )}
        {campus.catalog.status === "error" && (
          <View style={styles.message}>
            <Text>No se pudo cargar el catálogo.</Text>
            <Action label="Reintentar catálogo" onPress={campus.retry} />
          </View>
        )}
        {campus.catalog.status === "ready" && (
          <>
            {campus.query.trim().length > 0 && (
              <SearchSuggestions places={campus.visible} onSelect={select} />
            )}
            <Action
              label={`Ver lugares (${campus.visible.length})`}
              onPress={() => {
                Keyboard.dismiss();
                setListOpen(true);
              }}
            />
            {campus.visible.length === 0 && (
              <Text accessibilityLiveRegion="polite">
                No hay coincidencias. Cambia la búsqueda o restablece los
                filtros.
              </Text>
            )}
            <CampusMap
              allPlaces={campus.places}
              places={campus.visible}
              selected={campus.selected}
              onSelect={select}
              mode={mapMode(process.env.EXPO_PUBLIC_MAP_MODE)}
              {...(process.env.EXPO_PUBLIC_MAPTILER_KEY
                ? { apiKey: process.env.EXPO_PUBLIC_MAPTILER_KEY }
                : {})}
            />
          </>
        )}
        <Text style={styles.attribution}>
          Datos de lugares © colaboradores de OpenStreetMap · ODbL
        </Text>
        <CampusDialogs
          campus={campus}
          listOpen={listOpen}
          onCloseList={() => setListOpen(false)}
          onSelect={select}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f6f8" },
  screen: { flex: 1, padding: 12, gap: 8 },
  title: { fontSize: 22, fontWeight: "700", color: "#18212b" },
  attribution: { fontSize: 12, color: "#414b57" },
  message: { flex: 1, justifyContent: "center", gap: 12, padding: 20 },
});
