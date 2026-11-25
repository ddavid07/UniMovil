import type { Place, PlaceCoordinates } from './places';
import type { WalkingRoute } from './routing';

export type EvidenceStatus = 'confirmed' | 'unknown' | 'unavailable' | 'affected';
export type MobilityCategory =
  'access' | 'parking' | 'bicycle' | 'service' | 'transport';

export interface MobilityEvidence {
  status: EvidenceStatus;
  sourceUrl: string;
  license: string;
  checkedAt: string;
  scope: string;
}

export interface MobilityResource {
  place: Place;
  category: MobilityCategory;
  accessibility: MobilityEvidence;
  operation: MobilityEvidence;
  distanceMeters: number | null;
}

export interface RouteAccessibilityEvidence {
  wayId: string;
  wheelchair: EvidenceStatus;
  stepFree: EvidenceStatus;
}

export type AccessibleRouteAssessment =
  | { status: 'available' }
  | {
      status: 'unavailable';
      reason: 'no-route' | 'unknown-evidence' | 'affected-route';
    };

const CATEGORY_FOR_PLACE: Readonly<Record<Place['category'], MobilityCategory>> = {
  building: 'access',
  entrance: 'access',
  service: 'service',
  parking: 'parking',
  bicycle: 'bicycle',
  transport: 'transport',
};

function distanceBetween(first: PlaceCoordinates, second: PlaceCoordinates): number {
  const radians = Math.PI / 180;
  const latitudeDelta = (second.latitude - first.latitude) * radians;
  const longitudeDelta = (second.longitude - first.longitude) * radians;
  const firstLatitude = first.latitude * radians;
  const secondLatitude = second.latitude * radians;
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function unknownEvidence(place: Place, scope: string): MobilityEvidence {
  return {
    status: 'unknown',
    sourceUrl: place.source.url,
    license: place.source.license,
    checkedAt: place.source.checkedAt,
    scope,
  };
}

export function listMobilityResources(
  places: readonly Place[],
  origin: PlaceCoordinates | null,
  category: MobilityCategory | 'all',
): readonly MobilityResource[] {
  return places
    .filter(
      (place) => category === 'all' || CATEGORY_FOR_PLACE[place.category] === category,
    )
    .map((place) => ({
      place,
      category: CATEGORY_FOR_PLACE[place.category],
      accessibility: unknownEvidence(
        place,
        'La geometría de OpenStreetMap identifica el lugar, pero no acredita un acceso adaptado.',
      ),
      operation: unknownEvidence(
        place,
        'La cartografía no verifica estado operativo, horario, autorización ni disponibilidad.',
      ),
      distanceMeters: origin ? distanceBetween(origin, place.coordinates) : null,
    }))
    .sort((first, second) => {
      if (first.distanceMeters !== null && second.distanceMeters !== null) {
        return first.distanceMeters - second.distanceMeters;
      }
      return first.place.name.localeCompare(second.place.name, 'es');
    });
}

export function assessAccessibleRoute(
  route: Pick<WalkingRoute, 'wayIds'> | null,
  evidence: readonly RouteAccessibilityEvidence[],
): AccessibleRouteAssessment {
  if (!route || route.wayIds.length === 0) {
    return { status: 'unavailable', reason: 'no-route' };
  }

  const byWayId = new Map(evidence.map((fact) => [fact.wayId, fact]));
  const facts = route.wayIds.map((wayId) => byWayId.get(wayId));
  if (facts.some((fact) => !fact)) {
    return { status: 'unavailable', reason: 'unknown-evidence' };
  }
  if (
    facts.some(
      (fact) => fact!.wheelchair === 'affected' || fact!.stepFree === 'affected',
    )
  ) {
    return { status: 'unavailable', reason: 'affected-route' };
  }
  if (
    facts.some(
      (fact) => fact!.wheelchair !== 'confirmed' || fact!.stepFree !== 'confirmed',
    )
  ) {
    return { status: 'unavailable', reason: 'unknown-evidence' };
  }
  return { status: 'available' };
}
