import type { Coordinates } from "@unimovil/contracts";

export interface CampusNode {
  readonly id: string;
  readonly name: string;
  readonly coordinates: Coordinates;
  readonly isElevatedEntrance?: boolean;
}

export interface CampusEdge {
  readonly id: string;
  readonly source: string;
  readonly target: string;
  readonly distanceMeters: number;
  readonly hasStairs: boolean;
  readonly hasRamp: boolean;
  readonly instruction: string;
  readonly path: readonly Coordinates[];
}

export const MONCLOA_CAMPUS_NODES: readonly CampusNode[] = [
  {
    id: "metro-ciudad-universitaria",
    name: "Metro Ciudad Universitaria",
    coordinates: { latitude: 40.4442, longitude: -3.7262 },
  },
  {
    id: "facultad-medicina-principal",
    name: "Facultad de Medicina (Entrada Principal)",
    coordinates: { latitude: 40.4455, longitude: -3.7275 },
  },
  {
    id: "facultad-medicina-escalera",
    name: "Escalinata de Medicina",
    coordinates: { latitude: 40.4452, longitude: -3.7271 },
    isElevatedEntrance: true,
  },
  {
    id: "facultad-medicina-rampa",
    name: "Acceso Adaptado / Rampa Medicina",
    coordinates: { latitude: 40.4458, longitude: -3.7278 },
  },
  {
    id: "facultad-odontologia",
    name: "Facultad de Odontología",
    coordinates: { latitude: 40.4468, longitude: -3.7285 },
  },
  {
    id: "facultad-farmacia",
    name: "Facultad de Farmacia",
    coordinates: { latitude: 40.4475, longitude: -3.7265 },
  },
  {
    id: "facultad-derecho",
    name: "Facultad de Derecho",
    coordinates: { latitude: 40.4502, longitude: -3.731 },
  },
  {
    id: "facultad-filosofia",
    name: "Facultad de Filosofía y Letras",
    coordinates: { latitude: 40.4515, longitude: -3.7325 },
  },
  {
    id: "edificio-estudiantes",
    name: "Edificio de Estudiantes UCM",
    coordinates: { latitude: 40.446, longitude: -3.725 },
  },
  {
    id: "complejo-deportivo-zona-sur",
    name: "Complejo Deportivo Zona Sur",
    coordinates: { latitude: 40.442, longitude: -3.729 },
  },
  {
    id: "mirador-inaccesible-test",
    name: "Mirador Alto (Solo escaleras para pruebas PMR)",
    coordinates: { latitude: 40.4485, longitude: -3.7295 },
    isElevatedEntrance: true,
  },
];

export const MONCLOA_CAMPUS_EDGES: readonly CampusEdge[] = [
  // Metro -> Escalinata Medicina (Camino estándar directo con escaleras)
  {
    id: "edge-metro-med-stairs",
    source: "metro-ciudad-universitaria",
    target: "facultad-medicina-escalera",
    distanceMeters: 130,
    hasStairs: true,
    hasRamp: false,
    instruction: "Sube por la escalinata principal hacia Medicina",
    path: [
      { latitude: 40.4442, longitude: -3.7262 },
      { latitude: 40.4452, longitude: -3.7271 },
    ],
  },
  {
    id: "edge-med-stairs-med-main",
    source: "facultad-medicina-escalera",
    target: "facultad-medicina-principal",
    distanceMeters: 40,
    hasStairs: false,
    hasRamp: false,
    instruction: "Avanza hacia el hall central de Medicina",
    path: [
      { latitude: 40.4452, longitude: -3.7271 },
      { latitude: 40.4455, longitude: -3.7275 },
    ],
  },
  // Metro -> Rampa Medicina (Camino accesible alternativo, algo más largo pero sin escaleras)
  {
    id: "edge-metro-med-ramp",
    source: "metro-ciudad-universitaria",
    target: "facultad-medicina-rampa",
    distanceMeters: 190,
    hasStairs: false,
    hasRamp: true,
    instruction:
      "Toma el sendero accesible y la rampa suave hacia Medicina Norte",
    path: [
      { latitude: 40.4442, longitude: -3.7262 },
      { latitude: 40.445, longitude: -3.7268 },
      { latitude: 40.4458, longitude: -3.7278 },
    ],
  },
  {
    id: "edge-med-ramp-med-main",
    source: "facultad-medicina-rampa",
    target: "facultad-medicina-principal",
    distanceMeters: 50,
    hasStairs: false,
    hasRamp: false,
    instruction: "Accede al vestíbulo adaptado de Medicina",
    path: [
      { latitude: 40.4458, longitude: -3.7278 },
      { latitude: 40.4455, longitude: -3.7275 },
    ],
  },
  // Medicina Principal -> Odontología
  {
    id: "edge-med-odontologia",
    source: "facultad-medicina-principal",
    target: "facultad-odontologia",
    distanceMeters: 160,
    hasStairs: false,
    hasRamp: false,
    instruction:
      "Avanza por la acera peatonal de Plaza de Ramón y Cajal hacia Odontología",
    path: [
      { latitude: 40.4455, longitude: -3.7275 },
      { latitude: 40.4468, longitude: -3.7285 },
    ],
  },
  // Metro -> Edificio Estudiantes
  {
    id: "edge-metro-estudiantes",
    source: "metro-ciudad-universitaria",
    target: "edificio-estudiantes",
    distanceMeters: 220,
    hasStairs: false,
    hasRamp: false,
    instruction:
      "Sigue la Avenida Complutense en dirección este hacia el Edificio de Estudiantes",
    path: [
      { latitude: 40.4442, longitude: -3.7262 },
      { latitude: 40.446, longitude: -3.725 },
    ],
  },
  // Edificio Estudiantes -> Farmacia
  {
    id: "edge-estudiantes-farmacia",
    source: "edificio-estudiantes",
    target: "facultad-farmacia",
    distanceMeters: 210,
    hasStairs: false,
    hasRamp: false,
    instruction: "Continúa por el bulevar peatonal hacia Farmacia",
    path: [
      { latitude: 40.446, longitude: -3.725 },
      { latitude: 40.4475, longitude: -3.7265 },
    ],
  },
  // Odontología -> Farmacia
  {
    id: "edge-odontologia-farmacia",
    source: "facultad-odontologia",
    target: "facultad-farmacia",
    distanceMeters: 180,
    hasStairs: false,
    hasRamp: false,
    instruction: "Cruza la senda central hacia Farmacia",
    path: [
      { latitude: 40.4468, longitude: -3.7285 },
      { latitude: 40.4475, longitude: -3.7265 },
    ],
  },
  // Farmacia -> Derecho
  {
    id: "edge-farmacia-derecho",
    source: "facultad-farmacia",
    target: "facultad-derecho",
    distanceMeters: 450,
    hasStairs: false,
    hasRamp: false,
    instruction: "Avanza por la Avda. Complutense hacia la Facultad de Derecho",
    path: [
      { latitude: 40.4475, longitude: -3.7265 },
      { latitude: 40.4502, longitude: -3.731 },
    ],
  },
  // Derecho -> Filosofía
  {
    id: "edge-derecho-filosofia",
    source: "facultad-derecho",
    target: "facultad-filosofia",
    distanceMeters: 200,
    hasStairs: false,
    hasRamp: false,
    instruction: "Sigue el paseo de los jardines de Filosofía",
    path: [
      { latitude: 40.4502, longitude: -3.731 },
      { latitude: 40.4515, longitude: -3.7325 },
    ],
  },
  // Metro -> Deportes Zona Sur
  {
    id: "edge-metro-deportes",
    source: "metro-ciudad-universitaria",
    target: "complejo-deportivo-zona-sur",
    distanceMeters: 350,
    hasStairs: false,
    hasRamp: false,
    instruction: "Desciende hacia el Complejo Deportivo Sur",
    path: [
      { latitude: 40.4442, longitude: -3.7262 },
      { latitude: 40.442, longitude: -3.729 },
    ],
  },
  // Odontología -> Mirador Inaccesible (Único acceso con escaleras no adaptadas, para pruebas PMR)
  {
    id: "edge-odontologia-mirador",
    source: "facultad-odontologia",
    target: "mirador-inaccesible-test",
    distanceMeters: 210,
    hasStairs: true,
    hasRamp: false,
    instruction: "Sube los 45 escalones de piedra empinados hacia el Mirador",
    path: [
      { latitude: 40.4468, longitude: -3.7285 },
      { latitude: 40.4485, longitude: -3.7295 },
    ],
  },
];
