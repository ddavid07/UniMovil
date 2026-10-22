import { mkdir, writeFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { parsePlaces, PLACE_CATEGORIES } from "@unimovil/contracts";
import catalog from "../data/catalog.json";
import { createSearchIndex, findPlaces } from "./places";

it("mantiene búsqueda y filtros p95 <= 30 ms con 1.000 registros sintéticos", async () => {
  const base = parsePlaces(catalog)[0]!;
  const synthetic = Array.from({ length: 1_000 }, (_, index) => ({
    ...base,
    id: `synthetic-${index}`,
    name: `Edificio de prueba ${index}`,
  }));
  const index = createSearchIndex(synthetic);
  for (let warmup = 0; warmup < 20; warmup += 1)
    findPlaces(index, "edificio", PLACE_CATEGORIES);
  const samples = Array.from({ length: 100 }, () => {
    const start = performance.now();
    expect(findPlaces(index, "edificio", PLACE_CATEGORIES)).toHaveLength(1_000);
    return performance.now() - start;
  }).sort((a, b) => a - b);
  await mkdir("test-results", { recursive: true });
  await writeFile(
    "test-results/search-performance.json",
    JSON.stringify(
      {
        metric: "search-and-filter",
        records: synthetic.length,
        warmups: 20,
        samplesMs: samples,
        p95Ms: samples[94],
        budgetMs: 30,
        node: process.version,
        environment: "Node.js, not a native device",
      },
      null,
      2,
    ),
  );
  expect(samples[94]).toBeLessThanOrEqual(30);
});
