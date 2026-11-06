module.exports = {
  preset: "jest-expo",
  testMatch: ["**/src/**/*.test.tsx"],
  moduleNameMapper: {
    "^react$": require.resolve("react"),
    "^react/jsx-runtime$": require.resolve("react/jsx-runtime"),
    "^react/jsx-dev-runtime$": require.resolve("react/jsx-dev-runtime"),
    "^@unimovil/contracts$": "<rootDir>/../../packages/contracts/src/index.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverageFrom: [
    "src/features/campus/**/*.tsx",
    "src/features/campus/use*.ts",
    "src/features/campus/map/use*.ts",
  ],
  coverageDirectory: "../../coverage/mobile",
  coverageReporters: ["text", "json-summary", "lcov"],
  coverageThreshold: {
    global: { lines: 90, statements: 90, functions: 90, branches: 85 },
  },
};
