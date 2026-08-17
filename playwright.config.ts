import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// Sandboxed environments ship one pinned Chromium at /opt/pw-browsers/chromium
// (see PLAYWRIGHT_BROWSERS_PATH); when the Playwright version's own browser
// build isn't downloadable there, launch that binary directly. On a normal
// dev machine this resolves to undefined and Playwright uses its own install.
const PREINSTALLED_CHROMIUM = "/opt/pw-browsers/chromium";
const executablePath = existsSync(PREINSTALLED_CHROMIUM)
  ? PREINSTALLED_CHROMIUM
  : undefined;
const chromium = {
  browserName: "chromium" as const,
  launchOptions: executablePath ? { executablePath } : {},
};

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    // Every place unlock is meant to work with no network; a stray external
    // request should fail the suite rather than pass silently (FR-003b).
    serviceWorkers: "allow",
  },
  projects: [
    {
      name: "iPhone 13",
      // iPhone 13 metrics (viewport, UA, touch) on the Chromium engine so the
      // suite runs where WebKit binaries can't be installed (e.g. sandboxed
      // CI). Swap to the default WebKit engine locally by removing
      // browserName when `npx playwright install webkit` is available.
      use: { ...devices["iPhone 13"], ...chromium },
    },
    { name: "Pixel 5", use: { ...devices["Pixel 5"], ...chromium } },
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"], ...chromium } },
  ],
  webServer: {
    // Build + preview (not dev) so the service worker really exists — offline
    // behaviour cannot be tested against the dev server.
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
