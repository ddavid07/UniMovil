import {
  type IncidentReportInput,
  type IncidentReportStatus,
  type IncidentValidationError,
  validateIncidentReport,
} from "@unimovil/contracts";

export interface Incident extends IncidentReportInput {
  readonly id: string;
  readonly status: IncidentReportStatus;
  readonly reportedAt: string;
  readonly updatedAt?: string | undefined;
  readonly resolvedAt?: string | undefined;
}

export interface IncidentSubmissionResult {
  readonly success: boolean;
  readonly incident?: Incident;
  readonly errors?: readonly IncidentValidationError[];
}

export type IncidentListener = (incidents: readonly Incident[]) => void;

export class IncidentStore {
  private incidents: Incident[] = [];
  private listeners: Set<IncidentListener> = new Set();
  private nextId = 1;

  constructor(seedIncidents: readonly Incident[] = []) {
    this.incidents = [...seedIncidents];
    this.nextId = seedIncidents.length + 1;
  }

  public getAll(): readonly Incident[] {
    return [...this.incidents];
  }

  public getActive(): readonly Incident[] {
    return this.incidents.filter((inc) => inc.status !== "resuelta");
  }

  public getById(id: string): Incident | undefined {
    return this.incidents.find((inc) => inc.id === id);
  }

  public submitIncident(input: unknown): IncidentSubmissionResult {
    const validation = validateIncidentReport(input);
    if (!validation.isValid || !validation.data) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    const validData: IncidentReportInput = validation.data;
    const newIncident: Incident = {
      id: `inc-${this.nextId++}`,
      title: validData.title,
      description: validData.description,
      type: validData.type,
      severity: validData.severity,
      coordinates: validData.coordinates,
      status: "reportada",
      reportedAt: validData.reportedAt ?? new Date().toISOString(),
    };

    this.incidents.push(newIncident);
    this.notifyListeners();

    return {
      success: true,
      incident: newIncident,
    };
  }

  public updateStatus(id: string, newStatus: IncidentReportStatus): boolean {
    const target = this.incidents.find((inc) => inc.id === id);
    if (!target) {
      return false;
    }

    const index = this.incidents.indexOf(target);
    const updated: Incident = {
      ...target,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      ...(newStatus === "resuelta"
        ? { resolvedAt: new Date().toISOString() }
        : {}),
    };

    // eslint-disable-next-line security/detect-object-injection
    this.incidents[index] = updated;
    this.notifyListeners();
    return true;
  }

  public subscribe(listener: IncidentListener): () => void {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const current = this.getAll();
    for (const listener of this.listeners) {
      listener(current);
    }
  }
}

export const MONCLOA_CAMPUS_SEED_INCIDENTS: readonly Incident[] = [
  {
    id: "inc-seed-01",
    title: "Obras en vial de acceso a Medicina",
    description:
      "Zanja señalizada en acera peatonal derecha por canalizaciones eléctricas.",
    type: "obra",
    severity: "alta",
    coordinates: { latitude: 40.4435, longitude: -3.727 },
    status: "reportada",
    reportedAt: "2026-11-14T09:00:00.000Z",
  },
  {
    id: "inc-seed-02",
    title: "Rampa averiada junto a Biblioteca María Zambrano",
    description: "Pendiente resbaladiza por reparaciones de solado.",
    type: "rampa_averiada",
    severity: "critica",
    coordinates: { latitude: 40.4485, longitude: -3.731 },
    status: "en_curso",
    reportedAt: "2026-11-15T08:30:00.000Z",
  },
];
