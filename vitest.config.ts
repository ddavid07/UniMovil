import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "apps/api/src/**/*.spec.ts",
      "apps/admin/src/**/*.{test,spec}.{ts,tsx}",
      "packages/*/src/**/*.{test,spec}.ts",
    ],
    passWithNoTests: true,
  },
});
