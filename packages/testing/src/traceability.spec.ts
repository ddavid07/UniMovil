import { describe, expect, it } from "vitest";
import {
  calculateTraceabilityMetrics,
  getAllStories,
  getStoriesByEpic,
  getStoriesBySprint,
  getStoriesByTestCategory,
  getStoryById,
  REQUIREMENT_TRACEABILITY_MATRIX,
  verifyTraceabilityIntegrity,
  type TestCategory,
} from "./traceability.js";

describe("Matriz de Trazabilidad de Requisitos (RTM) — Verificación de Calidad", () => {
  it("contiene exactamente las 68 historias de usuario catalogadas en el Product Backlog", () => {
    const stories = getAllStories();
    expect(stories.length).toBe(68);
  });

  it("garantiza identificadores únicos sin colisiones en todo el catálogo de requisitos", () => {
    const ids = REQUIREMENT_TRACEABILITY_MATRIX.map((s) => s.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("alcanza el 100 % de cobertura de trazabilidad formal con quality gates en PASSED", () => {
    const metrics = calculateTraceabilityMetrics();
    expect(metrics.totalStories).toBe(68);
    expect(metrics.coveredStories).toBe(68);
    expect(metrics.coveragePercentage).toBe(100);
    expect(metrics.allQualityGatesPassed).toBe(true);
  });

  it("valida la integridad estructural mediante verifyTraceabilityIntegrity()", () => {
    const result = verifyTraceabilityIntegrity();
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.totalVerified).toBe(68);
    expect(result.coveragePercentage).toBe(100);
  });

  it("distribuye historias a lo largo de los 4 sprints del ciclo de vida del proyecto", () => {
    const sprint1 = getStoriesBySprint(1);
    const sprint2 = getStoriesBySprint(2);
    const sprint3 = getStoriesBySprint(3);
    const sprint4 = getStoriesBySprint(4);

    expect(sprint1.length).toBeGreaterThan(0);
    expect(sprint2.length).toBeGreaterThan(0);
    expect(sprint3.length).toBeGreaterThan(0);
    expect(sprint4.length).toBeGreaterThan(0);

    const sumSprints =
      sprint1.length + sprint2.length + sprint3.length + sprint4.length;
    expect(sumSprints).toBe(68);
  });

  it("cubre todas las categorías de prueba requeridas por la teoría de pruebas", () => {
    const categories: TestCategory[] = [
      "UNIT",
      "INTEGRATION",
      "BLACK_BOX",
      "REGRESSION",
      "SYSTEM",
      "RECOVERY",
      "SECURITY",
    ];

    for (const cat of categories) {
      const matched = getStoriesByTestCategory(cat);
      expect(matched.length).toBeGreaterThan(0);
    }
  });

  it("permite consultar historias por su identificador unívoco", () => {
    const hu94 = getStoryById("HU-094");
    expect(hu94).toBeDefined();
    expect(hu94?.title).toBe("Gestionar errores y falta de conexión");
    expect(hu94?.testCategories).toContain("RECOVERY");

    const hu01 = getStoryById("HU-001");
    expect(hu01).toBeDefined();
    expect(hu01?.epic).toBe("01 - Acceso y cuentas");

    const inexistent = getStoryById("HU-999");
    expect(inexistent).toBeUndefined();
  });

  it("permite filtrar historias por subcadena de la épica", () => {
    const routingStories = getStoriesByEpic("Rutas");
    expect(routingStories.length).toBeGreaterThanOrEqual(10);
    expect(
      routingStories.every((s) => s.epic.includes("Rutas y transporte")),
    ).toBe(true);

    const securityStories = getStoriesByEpic("Seguridad");
    expect(securityStories.length).toBeGreaterThanOrEqual(8);
  });

  it("todos los criterios de aceptación son estrictamente mayores que cero", () => {
    for (const story of REQUIREMENT_TRACEABILITY_MATRIX) {
      expect(story.acceptanceCriteriaCount).toBeGreaterThanOrEqual(3);
    }
  });

  it("detecta anomalías e inconsistencias al verificar matrices defectuosas", () => {
    // 1. Matriz vacía
    const emptyMetrics = calculateTraceabilityMetrics([]);
    expect(emptyMetrics.totalStories).toBe(0);
    expect(emptyMetrics.coveragePercentage).toBe(0);

    // 2. Historias con duplicados, ficheros vacíos, categorías vacías y criterios inválidos
    const defectiveMatrix = [
      {
        id: "HU-TEST-1",
        title: "Test 1",
        epic: "Test",
        priority: "ALTA" as const,
        sprint: 1 as const,
        acceptanceCriteriaCount: 0,
        testFiles: [],
        testCategories: [],
        status: "PENDING" as const,
      },
      {
        id: "HU-TEST-1", // duplicado
        title: "Test 1 bis",
        epic: "Test",
        priority: "ALTA" as const,
        sprint: 1 as const,
        acceptanceCriteriaCount: 2,
        testFiles: ["test.spec.ts"],
        testCategories: ["UNIT" as const],
        status: "PASSED" as const,
      },
    ];

    const defectiveResult = verifyTraceabilityIntegrity(defectiveMatrix);
    expect(defectiveResult.isValid).toBe(false);
    expect(defectiveResult.errors.length).toBeGreaterThanOrEqual(4);
    expect(defectiveResult.errors.some((e) => e.includes("duplicado"))).toBe(
      true,
    );
    expect(
      defectiveResult.errors.some((e) => e.includes("ficheros de prueba")),
    ).toBe(true);
    expect(
      defectiveResult.errors.some((e) => e.includes("categorías de prueba")),
    ).toBe(true);
    expect(
      defectiveResult.errors.some((e) => e.includes("conteo inválido")),
    ).toBe(true);
  });
});
