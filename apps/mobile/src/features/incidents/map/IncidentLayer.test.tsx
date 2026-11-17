/**
 * Tests TDD – IncidentLayer (HU-053)
 * Metodología: Caja negra, clases de equivalencia y valores límite (Tema 3)
 *
 * @author pablopr06 <pabpalac@ucm.es>
 */
import { render } from "@testing-library/react-native";
import type { Incident } from "../domain/incidents";
import { IncidentLayer } from "./IncidentLayer";

const makeIncident = (overrides: Partial<Incident> = {}): Incident => ({
  id: "inc-test-01",
  title: "Obras en la calle",
  description: "Zanja señalizada en acera peatonal.",
  type: "obra",
  severity: "alta",
  coordinates: { latitude: 40.4435, longitude: -3.727 },
  status: "reportada",
  reportedAt: "2026-11-14T09:00:00.000Z",
  ...overrides,
});

describe("IncidentLayer – capa cartográfica de incidencias (HU-053, TDD Tema 3)", () => {
  // CE1: sin incidencias activas → no renderiza nada
  it("no renderiza nada cuando la lista de incidencias está vacía", async () => {
    const { toJSON } = await render(<IncidentLayer incidents={[]} />);
    expect(toJSON()).toBeNull();
  });

  // CE2: con una incidencia activa → renderiza el GeoJSONSource
  it("renderiza GeoJSONSource cuando hay incidencias activas", async () => {
    const incidents = [makeIncident()];
    const { toJSON } = await render(<IncidentLayer incidents={incidents} />);
    expect(toJSON()).not.toBeNull();
  });

  // CE3: con múltiples incidencias → sigue renderizando
  it("renderiza correctamente con múltiples incidencias", async () => {
    const incidents = [
      makeIncident({ id: "inc-01", type: "obra", severity: "alta" }),
      makeIncident({
        id: "inc-02",
        type: "rampa_averiada",
        severity: "critica",
      }),
      makeIncident({
        id: "inc-03",
        type: "desvio",
        severity: "media",
        status: "en_curso",
      }),
    ];
    const { toJSON } = await render(<IncidentLayer incidents={incidents} />);
    expect(toJSON()).not.toBeNull();
  });

  // CE4: incidencia resuelta también puede pintarse (la capa muestra todas)
  it("renderiza incidencias con estado resuelta cuando se pasan explícitamente", async () => {
    const incidents = [makeIncident({ status: "resuelta" })];
    const { toJSON } = await render(<IncidentLayer incidents={incidents} />);
    expect(toJSON()).not.toBeNull();
  });

  // CE5: visible=false → no renderiza aunque haya incidencias
  it("no renderiza cuando visible=false aunque haya incidencias", async () => {
    const incidents = [makeIncident()];
    const { toJSON } = await render(
      <IncidentLayer incidents={incidents} visible={false} />,
    );
    expect(toJSON()).toBeNull();
  });

  // CE6: visible=true (valor límite explícito) → renderiza
  it("renderiza cuando visible=true y hay incidencias", async () => {
    const incidents = [makeIncident()];
    const { toJSON } = await render(
      <IncidentLayer incidents={incidents} visible={true} />,
    );
    expect(toJSON()).not.toBeNull();
  });
});
