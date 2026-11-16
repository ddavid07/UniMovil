import { describe, expect, it } from "vitest";
import {
  IncidentStore,
  MONCLOA_CAMPUS_SEED_INCIDENTS,
} from "../domain/incidents.js";
import { incidentsToGeoJSON } from "../map/geojson.js";

describe("Pruebas de Integración Basadas en Hilos (Thread-Based Integration Testing)", () => {
  const validLocation = { latitude: 40.4492, longitude: -3.7295 };

  it("Hilo Principal: Formulario Móvil -> Validación de Contrato -> Almacén Temporal -> Capa Cartográfica", () => {
    // 1. Inicialización de la cadena de integración orientada a objetos
    const store = new IncidentStore(MONCLOA_CAMPUS_SEED_INCIDENTS);
    let lastRenderedGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> | null =
      null;

    // Conexión del hilo: la capa cartográfica se suscribe al almacén
    const unsubscribe = store.subscribe((currentIncidents) => {
      lastRenderedGeoJSON = incidentsToGeoJSON(currentIncidents);
    });

    const initialFeaturesCount = lastRenderedGeoJSON
      ? (lastRenderedGeoJSON as GeoJSON.FeatureCollection<GeoJSON.Point>)
          .features.length
      : 0;
    expect(initialFeaturesCount).toBe(MONCLOA_CAMPUS_SEED_INCIDENTS.length);

    // 2. Ejecución del hilo (Paso 1: Entrada móvil con datos de usuario)
    const mobileFormInput = {
      title: "Desvío provisional por obras en Paraninfo",
      description: "Paso cortado para peatones junto a parada de autobús EMT.",
      type: "desvio",
      severity: "alta",
      coordinates: validLocation,
    };

    // (Paso 2 & 3: Validación de contrato y persistencia en store)
    const submissionResult = store.submitIncident(mobileFormInput);

    expect(submissionResult.success).toBe(true);
    expect(submissionResult.incident).toBeDefined();
    expect(submissionResult.incident?.id).toMatch(/^inc-\d+/);
    expect(submissionResult.incident?.status).toBe("reportada");

    // (Paso 4: Refresco automático y reactivo de la capa cartográfica)
    expect(lastRenderedGeoJSON).not.toBeNull();
    const updatedFeatures = (
      lastRenderedGeoJSON as unknown as GeoJSON.FeatureCollection<GeoJSON.Point>
    ).features;
    expect(updatedFeatures.length).toBe(initialFeaturesCount + 1);

    const createdFeature = updatedFeatures.find(
      (f) =>
        f.properties?.["title"] === "Desvío provisional por obras en Paraninfo",
    );
    expect(createdFeature).toBeDefined();
    expect(createdFeature?.geometry.type).toBe("Point");
    const pointGeom = createdFeature?.geometry as GeoJSON.Point;
    expect(pointGeom.coordinates).toEqual([
      validLocation.longitude,
      validLocation.latitude,
    ]);
    expect(createdFeature?.properties?.["severity"]).toBe("alta");
    expect(createdFeature?.properties?.["markerColor"]).toBe("#F57C00"); // Naranja para alta

    unsubscribe();
  });

  it("Hilo de Interrupción por Error: Entrada corrupta interceptada sin alterar el almacén ni el mapa", () => {
    const store = new IncidentStore(MONCLOA_CAMPUS_SEED_INCIDENTS);
    let renderCount = 0;

    store.subscribe(() => {
      renderCount++;
    });

    // Estado inicial: 1 llamada de suscripción
    expect(renderCount).toBe(1);

    // Entrada inválida: título demasiado corto (< 3 caracteres)
    const corruptInput = {
      title: "X",
      description: "Descripción válida pero título inválido.",
      type: "obra",
      severity: "media",
      coordinates: validLocation,
    };

    const submissionResult = store.submitIncident(corruptInput);

    // El hilo intercepta la anomalía
    expect(submissionResult.success).toBe(false);
    expect(submissionResult.errors).toBeDefined();
    expect(submissionResult.errors?.length).toBeGreaterThan(0);

    // La capa cartográfica NO ha sufrido ningún refresco innecesario
    expect(renderCount).toBe(1);
    expect(store.getAll().length).toBe(MONCLOA_CAMPUS_SEED_INCIDENTS.length);
  });

  it("Hilo de Ciclo de Vida: Actualización de estado y cambio dinámico en marcadores", () => {
    const store = new IncidentStore(MONCLOA_CAMPUS_SEED_INCIDENTS);
    const targetIncident = MONCLOA_CAMPUS_SEED_INCIDENTS[0]!;

    expect(targetIncident.status).toBe("reportada");

    // Hilo de moderación / resolución
    const updatedOk = store.updateStatus(targetIncident.id, "resuelta");
    expect(updatedOk).toBe(true);

    // Intentar actualizar una incidencia que no existe
    const updatedNonExistent = store.updateStatus(
      "inc-inexistente-999",
      "resuelta",
    );
    expect(updatedNonExistent).toBe(false);

    const resolved = store.getById(targetIncident.id);
    expect(resolved?.status).toBe("resuelta");
    expect(resolved?.resolvedAt).toBeDefined();

    // Comprobación de filtrado de incidencias activas en el mapa
    const activeOnly = store.getActive();
    expect(activeOnly.some((inc) => inc.id === targetIncident.id)).toBe(false);

    const activeGeoJSON = incidentsToGeoJSON(activeOnly);
    expect(
      activeGeoJSON.features.some(
        (f) => f.properties?.["id"] === targetIncident.id,
      ),
    ).toBe(false);

    // Comprobación de asignación de colores por severidad
    const mediaIncident = {
      ...targetIncident,
      id: "inc-media",
      severity: "media" as const,
    };
    const bajaIncident = {
      ...targetIncident,
      id: "inc-baja",
      severity: "baja" as const,
    };
    const colorsGeoJSON = incidentsToGeoJSON([mediaIncident, bajaIncident]);
    expect(colorsGeoJSON.features[0]?.properties?.markerColor).toBe("#FBC02D"); // media
    expect(colorsGeoJSON.features[1]?.properties?.markerColor).toBe("#1976D2"); // baja
  });
});
