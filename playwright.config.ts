import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

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
    { name: "iPhone 13", use: { ...devices["iPhone 13"] } },
    { name: "Pixel 5", use: { ...devices["Pixel 5"] } },
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
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
