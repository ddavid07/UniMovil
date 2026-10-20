import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["apps/mobile/src/features/campus/domain/*.perf.ts"],
    passWithNoTests: false,
    maxWorkers: 1,
    fileParallelism: false,
  },
});
