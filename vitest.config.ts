import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    // e2e is Playwright's job, not Vitest's.
    exclude: ["tests/e2e/**", "node_modules/**", "dist/**"],
  },
});
