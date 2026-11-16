import { describe, expect, it } from "vitest";
import {
  parsePlaces,
  type Incident,
  type Place,
  type RouteRequest,
  type RouteResponse,
} from "@unimovil/contracts";
import { RoutesService } from "../../../api/src/routes/routes.service.js";
import {
  createSearchIndex,
  findPlaces,
} from "../../src/features/campus/domain/places.js";
import { IncidentStore } from "../../src/features/incidents/domain/incidents.js";
import { incidentsToGeoJSON } from "../../src/features/incidents/map/geojson.js";
import { OfflineCache } from "../../src/features/offline/domain/offline-cache.js";
import {
  buildRouteGeoJson,
  formatDistance,
  formatDuration,
} from "../../src/features/routing/domain/routing.js";
import { calculateMultimodalAlternatives } from "../../src/features/transit/domain/transit.js";
import rawCatalog from "../../src/features/campus/data/catalog.json";

describe("Pruebas de Sistema Basadas en Casos de Uso (CU-SYS)", () => {
  const routesService = new RoutesService();
  const campusPlaces: readonly Place[] = parsePlaces(rawCatalog);
  const searchIndex = createSearchIndex(campusPlaces);

  // Coordenadas clave del Campus de Moncloa
  const coordsMetro = { latitude: 40.4442, longitude: -3.7262 };
  const coordsInformatica = { latitude: 40.4526, longitude: -3.7335 };
  const coordsMedicina = { latitude: 40.4455, longitude: -3.7275 };

  describe("CU-SYS-01: Búsqueda de Lugar y Navegación Peatonal Extremo a Extremo", () => {
    it("permite al usuario buscar un edificio, obtener su ficha y calcular el itinerario a pie", () => {
      // 1. El usuario busca la Facultad de Farmacia por texto parcial
      const searchResults = findPlaces(searchIndex, "farmacia", ["building"]);
      expect(searchResults.length).toBeGreaterThan(0);
      const destinationPlace = searchResults[0]!;
      expect(destinationPlace.name).toContain("Farmacia");

      // 2. El usuario selecciona el punto de origen (Metro Ciudad Universitaria) y destino
      const routeRequest: RouteRequest = {
        origin: coordsMetro,
        destination: destinationPlace.coordinates,
        accessibleOnly: false,
      };

      // 3. El servicio calcula la ruta óptima mediante Dijkstra
      const route: RouteResponse = routesService.calculateRoute(routeRequest);
      expect(route).toBeDefined();
      expect(route.totalDistanceMeters).toBeGreaterThan(0);
      expect(route.estimatedDurationMinutes).toBeGreaterThanOrEqual(1);
      expect(route.segments.length).toBeGreaterThanOrEqual(1);

      // 4. Se formatean las distancias y tiempos para la interfaz de usuario
      const distanceText = formatDistance(route.totalDistanceMeters);
      const durationText = formatDuration(route.estimatedDurationMinutes);
      expect(distanceText).toMatch(/m|km/);
      expect(durationText).toMatch(/min/);

      // 5. Se genera la geometría GeoJSON LineString para la capa MapLibre del mapa móvil
      const geoJson = buildRouteGeoJson(route);
      expect(geoJson.type).toBe("Feature");
      expect(geoJson.geometry.type).toBe("LineString");
      expect(geoJson.geometry.coordinates.length).toBeGreaterThanOrEqual(2);
      expect(geoJson.properties.distanceMeters).toBe(route.totalDistanceMeters);
    });
  });

  describe("CU-SYS-02: Navegación Accesible PMR con Filtro de Barreras Arquitectónicas", () => {
    it("calcula un itinerario adaptado garantizando ausencia total de escaleras y resaltando accesos PMR", () => {
      // Petición estándar vs petición accesible
      const standardReq: RouteRequest = {
        origin: coordsMetro,
        destination: coordsMedicina,
        accessibleOnly: false,
      };

      const accessibleReq: RouteRequest = {
        origin: coordsMetro,
        destination: coordsMedicina,
        accessibleOnly: true,
      };

      const standardRoute = routesService.calculateRoute(standardReq);
      const accessibleRoute = routesService.calculateRoute(accessibleReq);

      expect(accessibleRoute).toBeDefined();
      expect(accessibleRoute.accessible).toBe(true);

      // Todos los tramos de la ruta adaptada deben certificar accesibilidad PMR y ausencia de escaleras
      for (const segment of accessibleRoute.segments) {
        expect(segment.isAccessible).toBe(true);
        expect(segment.hasStairs).toBe(false);
      }

      // La distancia adaptada es válida y coherente
      expect(accessibleRoute.totalDistanceMeters).toBeGreaterThan(0);
      expect(standardRoute.totalDistanceMeters).toBeGreaterThan(0);
    });
  });

  describe("CU-SYS-03: Comparativa Multimodal con Líneas EMT en Campus", () => {
    it("ofrece al usuario la comparativa simultánea entre trayecto a pie y líneas de autobús de Moncloa", () => {
      // Ruta peatonal calculada previamente
      const pedestrianReq: RouteRequest = {
        origin: coordsMetro,
        destination: coordsInformatica,
        accessibleOnly: false,
      };
      const pedestrianRoute = routesService.calculateRoute(pedestrianReq);

      // Evaluación multimodal con líneas y paradas oficiales del campus
      const multimodal = calculateMultimodalAlternatives(
        coordsMetro,
        coordsInformatica,
        pedestrianRoute,
      );

      expect(multimodal.length).toBeGreaterThanOrEqual(2);
      const walkingOption = multimodal.find((opt) => opt.mode === "walking");
      expect(walkingOption).toBeDefined();
      expect(walkingOption?.durationMinutes).toBe(
        pedestrianRoute.estimatedDurationMinutes,
      );
      expect(walkingOption?.available).toBe(true);

      const busOption = multimodal.find((opt) => opt.mode === "bus");
      expect(busOption).toBeDefined();
    });
  });

  describe("CU-SYS-04: Ciclo Completo de Incidencia Ciudadana y Refresco Cartográfico", () => {
    it("valida el reporte, lo persiste en el almacén reactivo, actualiza la capa GeoJSON y gestiona su resolución", () => {
      const incidentStore = new IncidentStore();
      let notifiedIncidents: readonly Incident[] = [];

      // La capa del mapa se suscribe reactivamente a los cambios
      incidentStore.subscribe((incidents) => {
        notifiedIncidents = incidents;
      });

      // 1. El usuario reporta una zanja en una calzada universitaria
      const submission = incidentStore.submitIncident({
        title: "Zanja de obras en Paseo Juan XXIII",
        description: "Paso cortado por reparación de tuberías en acera este.",
        type: "obra",
        severity: "alta",
        coordinates: coordsMetro,
      });

      expect(submission.success).toBe(true);
      expect(submission.incident).toBeDefined();
      const reportedId = submission.incident!.id;

      // 2. Se verifica que el almacén reactivo notificó a los oyentes
      expect(notifiedIncidents.length).toBe(1);
      expect(notifiedIncidents[0]?.id).toBe(reportedId);

      // 3. Se genera la capa GeoJSON para renderizado en MapLibre
      const geojson = incidentsToGeoJSON(incidentStore.getActive());
      expect(geojson.type).toBe("FeatureCollection");
      expect(geojson.features.length).toBe(1);
      const feature = geojson.features[0]!;
      expect(feature.properties?.id).toBe(reportedId);
      expect(feature.properties?.severity).toBe("alta");
      expect(feature.properties?.markerColor).toBe("#F57C00"); // Naranja de severidad alta

      // 4. Un gestor resuelve la incidencia
      const updated = incidentStore.updateStatus(reportedId, "resuelta");
      expect(updated).toBe(true);

      // 5. La capa GeoJSON de incidencias activas se vacía automáticamente
      const activeGeojson = incidentsToGeoJSON(incidentStore.getActive());
      expect(activeGeojson.features.length).toBe(0);
    });
  });

  describe("CU-SYS-05: Historial y Persistencia de Rutas Recientes para Movilidad Recurrente", () => {
    it("persiste rutas frecuentes en la caché local para consulta instantánea", () => {
      const cache = new OfflineCache(5);

      const routeA = routesService.calculateRoute({
        origin: coordsMetro,
        destination: coordsMedicina,
      });

      cache.saveRecentRoute("metro", "medicina", false, routeA);

      // Consulta posterior
      const cached = cache.findCachedRoute("metro", "medicina", false);
      expect(cached).toBeDefined();
      expect(cached?.totalDistanceMeters).toBe(routeA.totalDistanceMeters);

      // Consulta de ruta no almacenada
      const nonExistent = cache.findCachedRoute("metro", "informatica", false);
      expect(nonExistent).toBeNull();
    });
  });
});
