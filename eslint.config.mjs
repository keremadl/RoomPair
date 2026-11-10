import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Every image is a small, local, pre-sized demo asset. Moving to
      // next/image is tracked in docs/BACKLOG.md.
      "@next/next/no-img-element": "off",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "scripts/**",
  ]),
]);
