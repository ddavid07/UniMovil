import transitData from '../data/campus-transit.json';
import {
  calculateWalkingRoute,
  CAMPUS_ROUTING_NETWORK,
  type WalkingRoute,
} from './routing';
import type { Place, PlaceCoordinates } from './places';

export interface TransitStop {
  id: string;
  name: string;
  reference: string;
  coordinates: PlaceCoordinates;
  url: string;
}

export interface TransitTripSchedule {
  serviceId: string;
  arrivals: readonly number[];
  departures: readonly number[];
}

export interface TransitPattern {
  id: string;
  directionId: string;
  headsign: string;
  stopIds: readonly string[];
  shapeDistances: readonly (number | null)[];
  shapes: readonly (readonly (readonly [number, number])[])[];
  trips: readonly TransitTripSchedule[];
}

export interface TransitLine {
  id: string;
  reference: string;
  name: string;
  url: string;
  color: string;
  textColor: string;
  stopIds: readonly string[];
  patterns: readonly TransitPattern[];
}

export interface TransitService {
  id: string;
  startDate: string;
  endDate: string;
  weekdays: readonly [boolean, boolean, boolean, boolean, boolean, boolean, boolean];
}

export interface TransitServiceException {
  serviceId: string;
  date: string;
  active: boolean;
}

export interface TransitDataset {
  source: {
    name: 'EMT Madrid';
    datasetUrl: string;
    downloadUrl: string;
    license: 'Open Data Commons Attribution License';
    licenseUrl: string;
    checkedAt: string;
    updatedAt: string;
    timeZone: string;
    archiveSha256: string;
    campusBoundarySource: string;
    campusBoundaryLicense: 'ODbL-1.0';
    schedulesAreRealtime: false;
  };
  services: readonly TransitService[];
  serviceExceptions: readonly TransitServiceException[];
  lines: readonly TransitLine[];
  stops: readonly TransitStop[];
}

export interface ScheduledDeparture {
  lineId: string;
  lineReference: string;
  headsign: string;
  scheduledTime: string;
  minutesUntil: number;
  serviceDate: string;
}

export interface TransitRoute {
  lineId: string;
  lineReference: string;
  headsign: string;
  originStop: TransitStop;
  destinationStop: TransitStop;
  walkingToStop: WalkingRoute;
  walkingFromStop: WalkingRoute;
  walkingToStopDistanceMeters: number;
  walkingFromStopDistanceMeters: number;
  walkingDistanceMeters: number;
  transitDistanceMeters: number;
  totalDistanceMeters: number;
  waitMinutes: number;
  rideMinutes: number;
  durationMinutes: number;
  departureTime: string;
  arrivalTime: string;
  transfers: 0;
  sourceCheckedAt: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCoordinates(value: unknown): value is PlaceCoordinates {
  return (
    isRecord(value) &&
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude) &&
    Number(value.latitude) >= -90 &&
    Number(value.latitude) <= 90 &&
    Number(value.longitude) >= -180 &&
    Number(value.longitude) <= 180
  );
}

function isShape(value: unknown): value is readonly (readonly [number, number])[] {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    value.every(
      (coordinate) =>
        Array.isArray(coordinate) &&
        coordinate.length === 2 &&
        Number.isFinite(coordinate[0]) &&
        Number.isFinite(coordinate[1]) &&
        Math.abs(Number(coordinate[0])) <= 180 &&
        Math.abs(Number(coordinate[1])) <= 90,
    )
  );
}

export function parseTransitDataset(value: unknown): TransitDataset {
  if (
    !isRecord(value) ||
    !isRecord(value.source) ||
    value.source.name !== 'EMT Madrid' ||
    value.source.license !== 'Open Data Commons Attribution License' ||
    typeof value.source.datasetUrl !== 'string' ||
    typeof value.source.downloadUrl !== 'string' ||
    typeof value.source.licenseUrl !== 'string' ||
    typeof value.source.checkedAt !== 'string' ||
    typeof value.source.updatedAt !== 'string' ||
    value.source.timeZone !== 'Europe/Madrid' ||
    typeof value.source.archiveSha256 !== 'string' ||
    !/^[a-f\d]{64}$/i.test(value.source.archiveSha256) ||
    typeof value.source.campusBoundarySource !== 'string' ||
    value.source.campusBoundaryLicense !== 'ODbL-1.0' ||
    value.source.schedulesAreRealtime !== false ||
    !Array.isArray(value.services) ||
    !Array.isArray(value.serviceExceptions) ||
    !Array.isArray(value.lines) ||
    !Array.isArray(value.stops)
  ) {
    throw new Error('El conjunto de transporte no conserva una fuente válida.');
  }

  const services = value.services.map((item): TransitService => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.startDate !== 'string' ||
      !/^\d{8}$/.test(item.startDate) ||
      typeof item.endDate !== 'string' ||
      !/^\d{8}$/.test(item.endDate) ||
      !Array.isArray(item.weekdays) ||
      item.weekdays.length !== 7 ||
      !item.weekdays.every((day) => typeof day === 'boolean')
    ) {
      throw new Error('El calendario de transporte contiene un servicio inválido.');
    }
    return item as unknown as TransitService;
  });
  const serviceIds = new Set(services.map((service) => service.id));
  if (serviceIds.size !== services.length) {
    throw new Error('El calendario de transporte contiene servicios duplicados.');
  }

  const serviceExceptions = value.serviceExceptions.map(
    (item): TransitServiceException => {
      if (
        !isRecord(item) ||
        typeof item.serviceId !== 'string' ||
        !serviceIds.has(item.serviceId) ||
        typeof item.date !== 'string' ||
        !/^\d{8}$/.test(item.date) ||
        typeof item.active !== 'boolean'
      ) {
        throw new Error('El calendario de transporte contiene una excepción inválida.');
      }
      return item as unknown as TransitServiceException;
    },
  );

  const stops = value.stops.map((item): TransitStop => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.reference !== 'string' ||
      !isCoordinates(item.coordinates) ||
      typeof item.url !== 'string'
    ) {
      throw new Error('El conjunto de transporte contiene una parada inválida.');
    }
    return item as unknown as TransitStop;
  });
  const stopIds = new Set(stops.map((stop) => stop.id));
  if (stopIds.size !== stops.length) {
    throw new Error('El conjunto de transporte contiene paradas duplicadas.');
  }

  const lines = value.lines.map((item): TransitLine => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.reference !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.url !== 'string' ||
      typeof item.color !== 'string' ||
      !/^#[0-9a-f]{6}$/i.test(item.color) ||
      typeof item.textColor !== 'string' ||
      !/^#[0-9a-f]{6}$/i.test(item.textColor) ||
      !Array.isArray(item.stopIds) ||
      !item.stopIds.every((id) => typeof id === 'string' && stopIds.has(id)) ||
      !Array.isArray(item.patterns)
    ) {
      throw new Error('El conjunto de transporte contiene una línea inválida.');
    }

    const patterns = item.patterns.map((pattern): TransitPattern => {
      const patternStopCount = Array.isArray(pattern.stopIds)
        ? pattern.stopIds.length
        : 0;
      if (
        !isRecord(pattern) ||
        typeof pattern.id !== 'string' ||
        typeof pattern.directionId !== 'string' ||
        typeof pattern.headsign !== 'string' ||
        !Array.isArray(pattern.stopIds) ||
        pattern.stopIds.length === 0 ||
        !pattern.stopIds.every((id) => typeof id === 'string' && stopIds.has(id)) ||
        !Array.isArray(pattern.shapeDistances) ||
        pattern.shapeDistances.length !== pattern.stopIds.length ||
        !pattern.shapeDistances.every(
          (distance) =>
            distance === null ||
            (typeof distance === 'number' && Number.isFinite(distance)),
        ) ||
        !Array.isArray(pattern.shapes) ||
        !pattern.shapes.every(isShape) ||
        !Array.isArray(pattern.trips) ||
        !pattern.trips.every(
          (trip) =>
            isRecord(trip) &&
            typeof trip.serviceId === 'string' &&
            serviceIds.has(trip.serviceId) &&
            Array.isArray(trip.arrivals) &&
            Array.isArray(trip.departures) &&
            trip.arrivals.length === patternStopCount &&
            trip.departures.length === patternStopCount &&
            trip.arrivals.every(
              (time) => typeof time === 'number' && Number.isInteger(time) && time >= 0,
            ) &&
            trip.departures.every(
              (time) => typeof time === 'number' && Number.isInteger(time) && time >= 0,
            ),
        )
      ) {
        throw new Error(
          'El conjunto de transporte contiene un patrón de línea inválido.',
        );
      }
      return pattern as unknown as TransitPattern;
    });

    if (
      patterns.length === 0 ||
      new Set(patterns.map((pattern) => pattern.id)).size !== patterns.length
    ) {
      throw new Error(
        'El conjunto de transporte contiene patrones vacíos o duplicados.',
      );
    }
    return { ...(item as unknown as TransitLine), patterns };
  });
  if (new Set(lines.map((line) => line.id)).size !== lines.length) {
    throw new Error('El conjunto de transporte contiene líneas duplicadas.');
  }

  return {
    source: value.source as unknown as TransitDataset['source'],
    services,
    serviceExceptions,
    lines,
    stops,
  };
}

export const CAMPUS_TRANSIT = parseTransitDataset(transitData);

export function getLineStops(
  line: TransitLine,
  stops: readonly TransitStop[],
  patternId?: string,
): readonly TransitStop[] {
  const pattern =
    line.patterns.find((candidate) => candidate.id === patternId) ?? line.patterns[0];
  if (!pattern) return [];
  const stopsById = new Map(stops.map((stop) => [stop.id, stop]));
  return pattern.stopIds.flatMap((id) => {
    const stop = stopsById.get(id);
    return stop ? [stop] : [];
  });
}

export function linesServingStop(
  stop: TransitStop,
  lines: readonly TransitLine[],
): readonly TransitLine[] {
  return lines.filter((line) => line.stopIds.includes(stop.id));
}

export function transitStopAsPlace(stop: TransitStop): Place {
  return {
    id: `emt-stop-${stop.id}`,
    name: stop.name,
    category: 'transport',
    coordinates: stop.coordinates,
    aliases: [stop.reference],
    source: {
      url: stop.url || CAMPUS_TRANSIT.source.datasetUrl,
      license: CAMPUS_TRANSIT.source.license,
      checkedAt: CAMPUS_TRANSIT.source.checkedAt,
    },
  };
}

function dateKeyInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}${part('month')}${part('day')}`;
}

function shiftDateKey(key: string, amount: number): string {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(4, 6));
  const day = Number(key.slice(6, 8));
  const shifted = new Date(Date.UTC(year, month - 1, day + amount));
  return `${shifted.getUTCFullYear()}${String(shifted.getUTCMonth() + 1).padStart(2, '0')}${String(shifted.getUTCDate()).padStart(2, '0')}`;
}

function weekdayIndexForDateKey(key: string): number {
  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(4, 6));
  const day = Number(key.slice(6, 8));
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

function isServiceActiveOnDate(
  dataset: TransitDataset,
  serviceId: string,
  dateKey: string,
): boolean {
  const exception = dataset.serviceExceptions.find(
    (item) => item.serviceId === serviceId && item.date === dateKey,
  );
  if (exception) return exception.active;

  const service = dataset.services.find((item) => item.id === serviceId);
  if (!service || dateKey < service.startDate || dateKey > service.endDate)
    return false;
  return service.weekdays[weekdayIndexForDateKey(dateKey)] ?? false;
}

function currentSecondsInTimeZone(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const part = (type: string) =>
    Number(parts.find((item) => item.type === type)?.value ?? 0);
  return part('hour') * 3600 + part('minute') * 60 + part('second');
}

function formatScheduledSeconds(seconds: number): string {
  const dayOffset = Math.floor(seconds / 86_400);
  const localSeconds = seconds % 86_400;
  const hours = Math.floor(localSeconds / 3600);
  const minutes = Math.floor((localSeconds % 3600) / 60);
  const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return dayOffset > 0 ? `${time} (+${dayOffset} día)` : time;
}

export function upcomingDeparturesForStop(
  stopId: string,
  now: Date = new Date(),
  dataset: TransitDataset = CAMPUS_TRANSIT,
  limit = 3,
): readonly ScheduledDeparture[] {
  const today = dateKeyInTimeZone(now, dataset.source.timeZone);
  const nowSeconds = currentSecondsInTimeZone(now, dataset.source.timeZone);
  const serviceDateOffsets = [0, -1] as const;
  const candidates: (ScheduledDeparture & { deltaSeconds: number })[] = [];

  for (const serviceDateOffset of serviceDateOffsets) {
    const serviceDate = shiftDateKey(today, serviceDateOffset);
    for (const line of dataset.lines) {
      for (const pattern of line.patterns) {
        const stopIndex = pattern.stopIds.indexOf(stopId);
        if (stopIndex < 0) continue;
        for (const trip of pattern.trips) {
          if (!isServiceActiveOnDate(dataset, trip.serviceId, serviceDate)) continue;
          const scheduledSeconds = trip.departures[stopIndex];
          if (scheduledSeconds === undefined) continue;
          if (serviceDateOffset < 0 && scheduledSeconds < 86_400) continue;
          const secondsToday = scheduledSeconds + serviceDateOffset * 86_400;
          const deltaSeconds = secondsToday - nowSeconds;
          if (deltaSeconds < 0 || deltaSeconds > 86_400) continue;
          candidates.push({
            lineId: line.id,
            lineReference: line.reference,
            headsign: pattern.headsign,
            scheduledTime: formatScheduledSeconds(secondsToday),
            minutesUntil: Math.ceil(deltaSeconds / 60),
            serviceDate,
            deltaSeconds,
          });
        }
      }
    }
  }

  const seen = new Set<string>();
  return candidates
    .sort((first, second) => first.deltaSeconds - second.deltaSeconds)
    .filter((candidate) => {
      const key = `${candidate.lineId}:${candidate.scheduledTime}:${candidate.headsign}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(({ deltaSeconds: _deltaSeconds, ...candidate }) => candidate);
}

function straightLineDistance(
  first: PlaceCoordinates,
  second: PlaceCoordinates,
): number {
  const radius = 6_371_000;
  const radians = Math.PI / 180;
  const latitudeDelta = (second.latitude - first.latitude) * radians;
  const longitudeDelta = (second.longitude - first.longitude) * radians;
  const latitude1 = first.latitude * radians;
  const latitude2 = second.latitude * radians;
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

interface WalkingStopCandidate {
  stop: TransitStop;
  route: WalkingRoute;
  distanceMeters: number;
  durationSeconds: number;
}

function walkingStopCandidates(
  coordinate: PlaceCoordinates,
  dataset: TransitDataset,
): readonly WalkingStopCandidate[] {
  const nearby = dataset.stops
    .map((stop) => ({
      stop,
      distance: straightLineDistance(coordinate, stop.coordinates),
    }))
    .filter(({ distance }) => distance <= 900)
    .sort((first, second) => first.distance - second.distance)
    .slice(0, 8);

  return nearby.flatMap(({ stop }) => {
    const result = calculateWalkingRoute(
      coordinate,
      stop.coordinates,
      CAMPUS_ROUTING_NETWORK,
    );
    if (result.status !== 'found') return [];
    const route = result.route;
    const snapDistance =
      route.originSnapDistanceMeters + route.destinationSnapDistanceMeters;
    const distanceMeters = route.distanceMeters + snapDistance;
    return [
      {
        stop,
        route,
        distanceMeters,
        durationSeconds: distanceMeters / 1.2,
      },
    ];
  });
}

interface TransitRouteCandidate {
  route: TransitRoute;
  arrivalDeltaSeconds: number;
}

/** Finds the fastest scheduled one-line bus journey with walkable campus access legs. */
export function calculateTransitRoute(
  origin: PlaceCoordinates,
  destination: PlaceCoordinates,
  now: Date = new Date(),
  dataset: TransitDataset = CAMPUS_TRANSIT,
): TransitRoute | null {
  const origins = walkingStopCandidates(origin, dataset);
  const destinations = walkingStopCandidates(destination, dataset);
  if (origins.length === 0 || destinations.length === 0) return null;

  const originById = new Map(
    origins.map((candidate) => [candidate.stop.id, candidate]),
  );
  const destinationById = new Map(
    destinations.map((candidate) => [candidate.stop.id, candidate]),
  );
  const today = dateKeyInTimeZone(now, dataset.source.timeZone);
  const nowSeconds = currentSecondsInTimeZone(now, dataset.source.timeZone);
  const candidates: TransitRouteCandidate[] = [];

  for (const serviceDateOffset of [-1, 0, 1]) {
    const serviceDate = shiftDateKey(today, serviceDateOffset);
    for (const line of dataset.lines) {
      for (const pattern of line.patterns) {
        const destinationIndicesByStop = new Map<string, number[]>();
        pattern.stopIds.forEach((stopId, index) => {
          if (!destinationById.has(stopId)) return;
          const indices = destinationIndicesByStop.get(stopId) ?? [];
          indices.push(index);
          destinationIndicesByStop.set(stopId, indices);
        });

        for (const [originIndex, originStopId] of pattern.stopIds.entries()) {
          const originCandidate = originById.get(originStopId);
          if (!originCandidate) continue;
          for (
            let destinationIndex = originIndex + 1;
            destinationIndex < pattern.stopIds.length;
            destinationIndex += 1
          ) {
            const destinationStop = pattern.stopIds[destinationIndex];
            if (!destinationStop || !destinationIndicesByStop.has(destinationStop))
              continue;
            const destinationCandidate = destinationById.get(destinationStop);
            if (!destinationCandidate) continue;

            for (const trip of pattern.trips) {
              if (!isServiceActiveOnDate(dataset, trip.serviceId, serviceDate))
                continue;
              const departureSeconds = trip.departures[originIndex];
              const arrivalSeconds = trip.arrivals[destinationIndex];
              if (departureSeconds === undefined || arrivalSeconds === undefined)
                continue;
              const departureDeltaSeconds =
                departureSeconds + serviceDateOffset * 86_400 - nowSeconds;
              const boardingBufferSeconds = originCandidate.durationSeconds;
              if (departureDeltaSeconds < boardingBufferSeconds) continue;
              const arrivalDeltaSeconds =
                arrivalSeconds + serviceDateOffset * 86_400 - nowSeconds;
              const totalSeconds =
                arrivalDeltaSeconds + destinationCandidate.durationSeconds;
              if (totalSeconds <= 0 || totalSeconds > 86_400) continue;

              const distanceToIndex = pattern.shapeDistances[originIndex];
              const distanceFromIndex = pattern.shapeDistances[destinationIndex];
              const transitDistanceMeters =
                distanceToIndex !== null &&
                distanceToIndex !== undefined &&
                distanceFromIndex !== null &&
                distanceFromIndex !== undefined &&
                distanceFromIndex >= distanceToIndex
                  ? distanceFromIndex - distanceToIndex
                  : straightLineDistance(
                      originCandidate.stop.coordinates,
                      destinationCandidate.stop.coordinates,
                    );
              const waitSeconds = departureDeltaSeconds - boardingBufferSeconds;
              const rideSeconds = arrivalSeconds - departureSeconds;
              candidates.push({
                route: {
                  lineId: line.id,
                  lineReference: line.reference,
                  headsign: pattern.headsign,
                  originStop: originCandidate.stop,
                  destinationStop: destinationCandidate.stop,
                  walkingToStop: originCandidate.route,
                  walkingFromStop: destinationCandidate.route,
                  walkingToStopDistanceMeters: originCandidate.distanceMeters,
                  walkingFromStopDistanceMeters: destinationCandidate.distanceMeters,
                  walkingDistanceMeters:
                    originCandidate.distanceMeters +
                    destinationCandidate.distanceMeters,
                  transitDistanceMeters,
                  totalDistanceMeters:
                    originCandidate.distanceMeters +
                    transitDistanceMeters +
                    destinationCandidate.distanceMeters,
                  waitMinutes: Math.ceil(Math.max(0, waitSeconds) / 60),
                  rideMinutes: Math.ceil(rideSeconds / 60),
                  durationMinutes: Math.ceil(totalSeconds / 60),
                  departureTime: formatScheduledSeconds(
                    departureSeconds + serviceDateOffset * 86_400,
                  ),
                  arrivalTime: formatScheduledSeconds(
                    arrivalSeconds + serviceDateOffset * 86_400,
                  ),
                  transfers: 0,
                  sourceCheckedAt: dataset.source.checkedAt,
                },
                arrivalDeltaSeconds: totalSeconds,
              });
            }
          }
        }
      }
    }
  }

  candidates.sort(
    (first, second) => first.arrivalDeltaSeconds - second.arrivalDeltaSeconds,
  );
  const best = candidates[0];
  if (!best) return null;
  return best.route;
}
