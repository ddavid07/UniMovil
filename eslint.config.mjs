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
      },
    },
  },
  prettier,
);
