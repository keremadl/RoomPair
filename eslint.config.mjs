import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Photos are local demo assets or data URLs picked by the user, which
      // next/image cannot optimise.
      "@next/next/no-img-element": "off",
      // The redesign predates this linter. These two rules flag 13 places
      // (refs written during render, state set inside effects) that work
      // today; they stay visible as warnings until each is reviewed.
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "scripts/**",
    "lab/**",
    ".lab/**",
    "automation/**",
  ]),
]);
