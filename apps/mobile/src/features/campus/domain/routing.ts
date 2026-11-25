import networkData from '../data/campus-routing-network.json';
import type { PlaceCoordinates } from './places';

export interface RoutingNode extends PlaceCoordinates {
  id: string;
}

export interface RoutingWay {
  id: string;
  version: string;
  updatedAt: string;
  properties: {
    highway: string;
    name?: string;
    surface?: string;
    foot?: string;
    access?: string;
    lit?: string;
    incline?: string;
  };
  nodes: readonly string[];
}

export interface RoutingNetwork {
  source: {
    source: string;
    url: string;
    license: 'ODbL-1.0';
    checkedAt: string;
    campusBoundarySource: string;
  };
  nodes: readonly RoutingNode[];
  ways: readonly RoutingWay[];
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  coordinates: readonly PlaceCoordinates[];
}

export interface WalkingRoute {
  coordinates: readonly PlaceCoordinates[];
  steps: readonly RouteStep[];
  wayIds: readonly string[];
  distanceMeters: number;
  durationMinutes: number;
  originSnapDistanceMeters: number;
  destinationSnapDistanceMeters: number;
  sourceCheckedAt: string;
}

export type RouteResult =
  | { status: 'found'; route: WalkingRoute }
  | { status: 'outside-network' }
  | { status: 'no-connection' };

interface RouteEdge {
  from: string;
  to: string;
  distanceMeters: number;
  way: RoutingWay;
}

interface RoutingGraph {
  nodes: ReadonlyMap<string, RoutingNode>;
  adjacency: ReadonlyMap<string, readonly RouteEdge[]>;
}

interface PreviousNode {
  nodeId: string;
  edge: RouteEdge;
}

class MinPriorityQueue {
  private readonly values: { id: string; distance: number }[] = [];

  get size(): number {
    return this.values.length;
  }

  push(value: { id: string; distance: number }): void {
    this.values.push(value);
    let index = this.values.length - 1;
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.values[parent]!.distance <= value.distance) break;
      this.values[index] = this.values[parent]!;
      index = parent;
    }
    this.values[index] = value;
  }

  pop(): { id: string; distance: number } | undefined {
    const first = this.values[0];
    const last = this.values.pop();
    if (!first || !last || this.values.length === 0) return first;

    let index = 0;
    while (index * 2 + 1 < this.values.length) {
      let child = index * 2 + 1;
      if (
        child + 1 < this.values.length &&
        this.values[child + 1]!.distance < this.values[child]!.distance
      ) {
        child += 1;
      }
      if (last.distance <= this.values[child]!.distance) break;
      this.values[index] = this.values[child]!;
      index = child;
    }
    this.values[index] = last;
    return first;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseRoutingNetwork(value: unknown): RoutingNetwork {
  if (!isRecord(value) || !isRecord(value.source)) {
    throw new Error('La red peatonal no tiene una fuente válida.');
  }

  const source = value.source;
  if (
    source.source !== 'OpenStreetMap contributors' ||
    source.license !== 'ODbL-1.0' ||
    typeof source.url !== 'string' ||
    typeof source.checkedAt !== 'string' ||
    typeof source.campusBoundarySource !== 'string' ||
    !Array.isArray(value.nodes) ||
    !Array.isArray(value.ways)
  ) {
    throw new Error('La red peatonal no conserva la procedencia requerida.');
  }

  const nodes = new Map<string, RoutingNode>();
  for (const item of value.nodes) {
    if (!isRecord(item)) throw new Error('La red incluye un nodo inválido.');
    const { id, latitude, longitude } = item;
    if (
      typeof id !== 'string' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Number(latitude) < -90 ||
      Number(latitude) > 90 ||
      Number(longitude) < -180 ||
      Number(longitude) > 180 ||
      nodes.has(id)
    ) {
      throw new Error('La red incluye un nodo inválido o duplicado.');
    }
    nodes.set(id, {
      id,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
  }

  const ways: RoutingWay[] = value.ways
    .map((item) => {
      if (!isRecord(item) || !isRecord(item.properties) || !Array.isArray(item.nodes)) {
        throw new Error('La red incluye un tramo inválido.');
      }
      const { id, version, updatedAt, properties } = item;
      if (
        typeof id !== 'string' ||
        typeof version !== 'string' ||
        typeof updatedAt !== 'string' ||
        typeof properties.highway !== 'string' ||
        item.nodes.length < 2 ||
        !item.nodes.every((nodeId) => typeof nodeId === 'string' && nodes.has(nodeId))
      ) {
        throw new Error('La red incluye un tramo con nodos o metadatos inválidos.');
      }
      return {
        id,
        version,
        updatedAt,
        properties: properties as RoutingWay['properties'],
        nodes: item.nodes as string[],
      };
    })
    .filter((way) => {
      const { access, foot } = way.properties;
      return (
        access !== 'no' &&
        access !== 'private' &&
        access !== 'permit' &&
        foot !== 'no' &&
        foot !== 'private' &&
        foot !== 'use_sidepath'
      );
    });

  return {
    source: source as RoutingNetwork['source'],
    nodes: [...nodes.values()],
    ways,
  };
}

export const CAMPUS_ROUTING_NETWORK = parseRoutingNetwork(networkData);

function distanceBetween(first: PlaceCoordinates, second: PlaceCoordinates): number {
  const earthRadius = 6_371_000;
  const radians = Math.PI / 180;
  const latitudeDelta = (second.latitude - first.latitude) * radians;
  const longitudeDelta = (second.longitude - first.longitude) * radians;
  const firstLatitude = first.latitude * radians;
  const secondLatitude = second.latitude * radians;
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(first: PlaceCoordinates, second: PlaceCoordinates): number {
  const radians = Math.PI / 180;
  const latitude1 = first.latitude * radians;
  const latitude2 = second.latitude * radians;
  const longitudeDelta = (second.longitude - first.longitude) * radians;
  const y = Math.sin(longitudeDelta) * Math.cos(latitude2);
  const x =
    Math.cos(latitude1) * Math.sin(latitude2) -
    Math.sin(latitude1) * Math.cos(latitude2) * Math.cos(longitudeDelta);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function normalizeAngle(angle: number): number {
  return ((angle + 540) % 360) - 180;
}

function nearestNetworkNode(
  nodes: readonly RoutingNode[],
  coordinate: PlaceCoordinates,
  maxDistanceMeters: number,
): { node: RoutingNode; distanceMeters: number } | undefined {
  let closest: { node: RoutingNode; distanceMeters: number } | undefined;
  for (const node of nodes) {
    const distanceMeters = distanceBetween(coordinate, node);
    if (!closest || distanceMeters < closest.distanceMeters) {
      closest = { node, distanceMeters };
    }
  }
  return closest && closest.distanceMeters <= maxDistanceMeters ? closest : undefined;
}

function createSteps(
  edges: readonly RouteEdge[],
  nodes: ReadonlyMap<string, RoutingNode>,
): RouteStep[] {
  if (edges.length === 0) return [];
  const groups: {
    edges: RouteEdge[];
    turn: 'start' | 'left' | 'right' | 'straight';
  }[] = [];
  let current: RouteEdge[] = [edges[0]!];
  groups.push({ edges: current, turn: 'start' });

  for (let index = 1; index < edges.length; index += 1) {
    const previous = edges[index - 1]!;
    const next = edges[index]!;
    const previousFrom = nodes.get(previous.from)!;
    const previousTo = nodes.get(previous.to)!;
    const nextTo = nodes.get(next.to)!;
    const turn = normalizeAngle(
      bearing(previousTo, nextTo) - bearing(previousFrom, previousTo),
    );
    const wayChanged =
      previous.way.properties.name !== next.way.properties.name ||
      previous.way.properties.highway !== next.way.properties.highway;
    if (Math.abs(turn) > 35 || wayChanged) {
      current = [next];
      groups.push({
        edges: current,
        turn: turn > 35 ? 'right' : turn < -35 ? 'left' : 'straight',
      });
    } else {
      current.push(next);
    }
  }

  return groups.map(({ edges: group, turn }) => {
    const first = group[0]!;
    const coordinates = [
      nodes.get(first.from)!,
      ...group.map((edge) => nodes.get(edge.to)!),
    ];
    const distanceMeters = group.reduce(
      (total, edge) => total + edge.distanceMeters,
      0,
    );
    const wayName = first.way.properties.name;
    const location = wayName ? ` por ${wayName}` : ' por el camino peatonal';
    const instruction =
      first.way.properties.highway === 'steps'
        ? 'Continúa por las escaleras.'
        : turn === 'start'
          ? `Dirígete${location}.`
          : turn === 'left'
            ? `Gira a la izquierda${location}.`
            : turn === 'right'
              ? `Gira a la derecha${location}.`
              : `Continúa${location}.`;
    return { instruction, distanceMeters, coordinates };
  });
}

const graphCache = new WeakMap<RoutingNetwork, RoutingGraph>();

function buildRoutingGraph(network: RoutingNetwork): RoutingGraph {
  const cached = graphCache.get(network);
  if (cached) return cached;

  const nodes = new Map(network.nodes.map((node) => [node.id, node]));
  const adjacency = new Map<string, RouteEdge[]>();
  for (const way of network.ways) {
    for (let index = 1; index < way.nodes.length; index += 1) {
      const from = way.nodes[index - 1]!;
      const to = way.nodes[index]!;
      const first = nodes.get(from)!;
      const second = nodes.get(to)!;
      const distanceMeters = distanceBetween(first, second);
      const forward = { from, to, distanceMeters, way };
      const backward = { from: to, to: from, distanceMeters, way };
      const fromEdges = adjacency.get(from) ?? [];
      const toEdges = adjacency.get(to) ?? [];
      fromEdges.push(forward);
      toEdges.push(backward);
      adjacency.set(from, fromEdges);
      adjacency.set(to, toEdges);
    }
  }

  const graph = { nodes, adjacency };
  graphCache.set(network, graph);
  return graph;
}

export function calculateWalkingRoute(
  origin: PlaceCoordinates,
  destination: PlaceCoordinates,
  network: RoutingNetwork = CAMPUS_ROUTING_NETWORK,
  maxSnapDistanceMeters = 100,
  preferences: { avoidStairs?: boolean } = {},
): RouteResult {
  if (
    !Number.isFinite(origin.latitude) ||
    !Number.isFinite(origin.longitude) ||
    !Number.isFinite(destination.latitude) ||
    !Number.isFinite(destination.longitude)
  ) {
    return { status: 'outside-network' };
  }

  const originSnap = nearestNetworkNode(network.nodes, origin, maxSnapDistanceMeters);
  const destinationSnap = nearestNetworkNode(
    network.nodes,
    destination,
    maxSnapDistanceMeters,
  );
  if (!originSnap || !destinationSnap) return { status: 'outside-network' };
  if (originSnap.node.id === destinationSnap.node.id) {
    return {
      status: 'found',
      route: {
        coordinates: [originSnap.node, destinationSnap.node],
        steps: [],
        wayIds: [],
        distanceMeters: 0,
        durationMinutes: 0,
        originSnapDistanceMeters: originSnap.distanceMeters,
        destinationSnapDistanceMeters: destinationSnap.distanceMeters,
        sourceCheckedAt: network.source.checkedAt,
      },
    };
  }

  const { nodes, adjacency } = buildRoutingGraph(network);

  const distances = new Map<string, number>([[originSnap.node.id, 0]]);
  const previous = new Map<string, PreviousNode>();
  const queue = new MinPriorityQueue();
  queue.push({ id: originSnap.node.id, distance: 0 });

  while (queue.size > 0) {
    const current = queue.pop()!;
    if (current.distance !== distances.get(current.id)) continue;
    if (current.id === destinationSnap.node.id) break;
    for (const edge of adjacency.get(current.id) ?? []) {
      if (preferences.avoidStairs && edge.way.properties.highway === 'steps') continue;
      const nextDistance = current.distance + edge.distanceMeters;
      if (nextDistance >= (distances.get(edge.to) ?? Number.POSITIVE_INFINITY))
        continue;
      distances.set(edge.to, nextDistance);
      previous.set(edge.to, { nodeId: current.id, edge });
      queue.push({ id: edge.to, distance: nextDistance });
    }
  }

  const distanceMeters = distances.get(destinationSnap.node.id);
  if (distanceMeters === undefined) return { status: 'no-connection' };

  const edges: RouteEdge[] = [];
  let cursor = destinationSnap.node.id;
  while (cursor !== originSnap.node.id) {
    const previousNode = previous.get(cursor);
    if (!previousNode) return { status: 'no-connection' };
    edges.push(previousNode.edge);
    cursor = previousNode.nodeId;
  }
  edges.reverse();
  const coordinates = [
    nodes.get(edges[0]!.from)!,
    ...edges.map((edge) => nodes.get(edge.to)!),
  ];
  const speedMetersPerSecond = 1.2;

  return {
    status: 'found',
    route: {
      coordinates,
      steps: createSteps(edges, nodes),
      wayIds: [...new Set(edges.map((edge) => edge.way.id))],
      distanceMeters,
      durationMinutes: Math.max(
        1,
        Math.round(distanceMeters / speedMetersPerSecond / 60),
      ),
      originSnapDistanceMeters: originSnap.distanceMeters,
      destinationSnapDistanceMeters: destinationSnap.distanceMeters,
      sourceCheckedAt: network.source.checkedAt,
    },
  };
}

export function formatRouteDistance(distanceMeters: number): string {
  if (distanceMeters < 1000) return `${Math.round(distanceMeters)} m`;
  return `${(distanceMeters / 1000).toFixed(1).replace('.', ',')} km`;
}

export function formatRouteDuration(durationMinutes: number): string {
  if (durationMinutes < 60) return `${durationMinutes} min`;
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}
