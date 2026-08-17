import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";

// SC-001 / plan performance goals: welcome usable ≤3 s on a mid-range phone
// over 4G; initial JS ≤150 kB gzip; offline precache within reason (<15 MB).
// The webServer builds dist/ before these run.

const DIST = path.resolve(import.meta.dirname, "../../dist");

test.describe("performance budgets", () => {
  // One static-analysis pass is enough; network throttling needs CDP.
  test.skip(({ browserName }) => browserName !== "chromium", "CDP throttling");

  test("initial JS is ≤150 kB gzipped", () => {
    test.skip(test.info().project.name !== "Desktop Chrome", "static check runs once");
    const indexHtml = readFileSync(path.join(DIST, "index.html"), "utf8");
    // Everything index.html references up front is the initial payload; the
    // lazy Recap chunk must not be among it.
    const scripts = [...indexHtml.matchAll(/assets\/[\w.-]+\.js/g)].map((m) => m[0]);
    expect(scripts.length).toBeGreaterThan(0);
    let total = 0;
    for (const script of new Set(scripts)) {
      total += gzipSync(readFileSync(path.join(DIST, script))).byteLength;
    }
    expect(total, `initial JS gzip bytes (${scripts.join(", ")})`).toBeLessThanOrEqual(
      150 * 1024,
    );
    expect(scripts.some((s) => /recap/i.test(s)), "Recap must be lazy").toBe(false);
  });

  test("offline precache stays reasonable (<15 MB) and includes the media", () => {
    test.skip(test.info().project.name !== "Desktop Chrome", "static check runs once");
    const sw = readFileSync(path.join(DIST, "sw.js"), "utf8");
    // The generated precache manifest must cover the app shell…
    expect(sw).toContain("index.html");
    expect(sw).toMatch(/assets\/[\w.-]+\.js/);
    // …and every emitted asset (JS, CSS, and any media too large for Vite to
    // inline as a data URI — the author's real photos will land here).
    for (const asset of readdirSync(path.join(DIST, "assets"))) {
      expect(sw, `${asset} missing from the offline precache`).toContain(
        `assets/${asset}`,
      );
    }

    const walk = (dir: string): number =>
      readdirSync(dir).reduce((sum, entry) => {
        const full = path.join(dir, entry);
        const stats = statSync(full);
        return sum + (stats.isDirectory() ? walk(full) : stats.size);
      }, 0);
    expect(walk(DIST)).toBeLessThan(15 * 1024 * 1024);
  });

  test("welcome is usable within 3 s over throttled 4G", async ({ page }) => {
    const client = await page.context().newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 100,
      downloadThroughput: (4 * 1024 * 1024) / 8, // 4 Mbps
      uploadThroughput: (3 * 1024 * 1024) / 8,
    });

    const startedAt = Date.now();
    await page.goto("/");
    await expect(page.getByRole("link", { name: /start the ride/i })).toBeVisible();
    const elapsed = Date.now() - startedAt;
    expect(elapsed, "ms until the primary action is usable").toBeLessThan(3000);
  });
});
