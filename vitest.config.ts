import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "apps/mobile/app.config.spec.ts",
      "apps/api/src/**/*.spec.ts",
      "apps/admin/src/**/*.{test,spec}.{ts,tsx}",
      "packages/*/src/**/*.{test,spec}.ts",
      "apps/mobile/src/features/campus/domain/*.spec.ts",
      "apps/mobile/src/features/campus/data/*.spec.ts",
      "apps/mobile/src/features/campus/map/*.spec.ts",
    ],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage/domain",
      reporter: ["text", "json-summary", "lcov"],
      include: [
        "apps/mobile/app.config.ts",
        "apps/api/src/**/*.spec.ts",
        "apps/admin/src/**/*.{test,spec}.{ts,tsx}",
        "packages/contracts/src/parse-places.ts",
        "apps/mobile/src/features/campus/domain/places.ts",
        "apps/mobile/src/features/campus/data/repository.ts",
        "apps/mobile/src/features/campus/map/geojson.ts",
        "apps/mobile/src/features/campus/map/map-style.ts",
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
        "packages/contracts/src/parse-places.ts": { branches: 100 },
        "apps/mobile/src/features/campus/domain/places.ts": { branches: 100 },
      },
    },
  },
});
