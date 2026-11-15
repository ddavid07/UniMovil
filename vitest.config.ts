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
      "apps/mobile/src/features/routing/__tests__/*.spec.ts",
      "apps/mobile/src/features/transit/__tests__/*.spec.ts",
      "apps/mobile/src/features/transit/map/*.spec.ts",
      "apps/mobile/src/features/offline/**/*.spec.ts",
    ],
    passWithNoTests: false,
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage/domain",
      reporter: ["text", "json-summary", "lcov"],
      include: [
        "apps/mobile/app.config.ts",
        "packages/contracts/src/parse-places.ts",
        "packages/contracts/src/routes.ts",
        "apps/mobile/src/features/campus/domain/places.ts",
        "apps/mobile/src/features/campus/data/repository.ts",
        "apps/mobile/src/features/campus/map/geojson.ts",
        "apps/mobile/src/features/campus/map/map-style.ts",
        "apps/api/src/routes/routes.service.ts",
        "apps/mobile/src/features/routing/domain/routing.ts",
        "apps/mobile/src/features/routing/domain/routing-errors.ts",
        "apps/mobile/src/features/transit/domain/transit.ts",
        "apps/mobile/src/features/transit/map/geojson.ts",
        "apps/mobile/src/features/offline/domain/offline-cache.ts",
      ],
      thresholds: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
        "packages/contracts/src/parse-places.ts": { branches: 100 },
        "apps/mobile/src/features/campus/domain/places.ts": { branches: 100 },
        "apps/mobile/src/features/routing/domain/routing.ts": { branches: 85 },
        "apps/mobile/src/features/routing/domain/routing-errors.ts": {
          branches: 85,
        },
      },
    },
  },
});
