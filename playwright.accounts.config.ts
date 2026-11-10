import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Browser tests for accounts and the shared database. They need a Supabase
// stack to talk to; locally that is `npx supabase start`, whose address and
// publishable key are the defaults below.
const url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
const key =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

export default defineConfig({
  ...base,
  testDir: "./tests/accounts",
  testIgnore: [],
  // Members created by one test must not appear in another test's feed order.
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { ...base.use, baseURL: "http://localhost:3100" },
  webServer: {
    command: "npx next dev --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: url,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
    },
  },
});
