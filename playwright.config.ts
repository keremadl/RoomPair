import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const channel = existsSync(
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
)
  ? "chrome"
  : existsSync("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe")
    ? "msedge"
    : undefined;

/** Cloud sandboxes ship a single preinstalled Chromium; use it when present. */
const sandboxChromium = "/opt/pw-browsers/chromium";
const launchOptions =
  !channel && existsSync(sandboxChromium) ? { executablePath: sandboxChromium } : undefined;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    channel,
    launchOptions,
    viewport: { width: 1440, height: 1050 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
