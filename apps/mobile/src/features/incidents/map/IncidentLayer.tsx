/**
 * IncidentLayer – Capa cartográfica de incidencias en el mapa (HU-053)
 *
 * Renderiza marcadores de advertencia de color naranja sobre el mapa MapLibre
 * para las incidencias activas del campus de Moncloa (obras, desvíos, rampas
 * averiadas, obstáculos temporales, aceras cortadas).
 *
 * @author pablopr06 <pabpalac@ucm.es>
 */
import { useMemo } from "react";
import { GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import type { Incident } from "../domain/incidents";
import { incidentsToGeoJSON } from "./geojson";

interface Props {
  /** Lista de incidencias a pintar en el mapa. */
  readonly incidents: readonly Incident[];
  /** Controla la visibilidad de la capa. Por defecto: true. */
  readonly visible?: boolean;
  readonly onSelectIncident?: ((incident: Incident) => void) | undefined;
}

/**
 * Componente que añade una capa de círculos naranjas de advertencia
 * al mapa del campus para cada incidencia.
 *
 * Color base: #f97316 (naranja, coherente con HU-053).
 * Las incidencias críticas usan #D32F2F (rojo) para máxima urgencia.
 */
export function IncidentLayer({
  incidents,
  visible = true,
  onSelectIncident,
}: Props) {
  const geojsonData = useMemo(() => incidentsToGeoJSON(incidents), [incidents]);

  if (!visible || incidents.length === 0) {
    return null;
  }

  return (
    <GeoJSONSource
      id="incidents-source"
      data={geojsonData}
      hitbox={{ top: 24, bottom: 24, left: 24, right: 24 }}
      onPress={(event) => {
        const id: unknown = event.nativeEvent.features[0]?.properties?.id;
        const selected = incidents.find((incident) => incident.id === id);
        if (selected) {
          event.stopPropagation();
          onSelectIncident?.(selected);
        }
      }}
    >
      {/* Halo blanco para contraste con el fondo del mapa */}
      <Layer
        id="incidents-halo"
        type="circle"
        paint={{
          "circle-radius": 14,
          "circle-color": "#ffffff",
          "circle-opacity": 0.9,
        }}
      />
      {/* Círculo naranja principal – color de advertencia de obras */}
      <Layer
        id="incidents-circle"
        type="circle"
        paint={{
          "circle-radius": 10,
          // Expresión data-driven: color según severidad de la incidencia
          "circle-color": [
            "match",
            ["get", "severity"],
            "critica",
            "#D32F2F",
            "alta",
            "#F57C00",
            "media",
            "#f97316",
            /* baja / default */
            "#FBC02D",
          ],
          "circle-opacity": 0.95,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        }}
      />
      {/* Símbolo ⚠ encima del círculo */}
      <Layer
        id="incidents-symbol"
        type="symbol"
        layout={{
          "text-field": "⚠",
          "text-size": 12,
          "text-allow-overlap": true,
        }}
        paint={{
          "text-color": "#ffffff",
        }}
      />
    </GeoJSONSource>
  );
}
