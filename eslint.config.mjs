import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/coverage/**",
      "**/dist/**",
      "**/.expo/**",
      "**/node_modules/**",
      "**/web-build/**",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  security.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-duplicate-imports": "error",
      "no-warning-comments": [
        "warn",
        { terms: ["TODO", "FIXME"], location: "start" },
      ],
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        URL: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
      },
    },
  },
  {
    files: [
      "apps/mobile/src/features/campus/**/*.{ts,tsx}",
      "packages/contracts/src/*.ts",
    ],
    ignores: ["**/*.test.tsx", "**/*.spec.ts", "**/*.perf.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      complexity: ["error", 10],
      "max-depth": ["error", 3],
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
      "max-lines-per-function": [
        "error",
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: [
      "apps/mobile/src/features/campus/domain/*.ts",
      "packages/contracts/src/*.ts",
    ],
    ignores: ["**/*.spec.ts", "**/*.perf.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: ["react", "react-native", "@maplibre/maplibre-react-native"],
          patterns: [
            "**/apps/**",
            "../data/**",
            "../map/**",
            "../components/**",
          ],
        },
      ],
    },
  },
  {
    files: ["apps/mobile/metro.config.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  prettier,
);
