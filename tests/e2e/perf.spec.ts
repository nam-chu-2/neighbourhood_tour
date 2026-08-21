import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { expect, test } from "@playwright/test";

// SC-001 / SC-003 / SC-004 and the plan's performance budgets: the dial is
// draggable ≤3 s on a mid-range phone over 4G, the needle answers a drag
// within a tenth of a second, a station is readable within 1 s of settling,
// and the initial JS stays ≤150 kB gzip. The webServer builds dist/ first.

const DIST = path.resolve(import.meta.dirname, "../../dist");

test.describe("performance budgets", () => {
  // One static-analysis pass is enough; network throttling needs CDP.
  test.skip(({ browserName }) => browserName !== "chromium", "CDP throttling");

  test("initial JS is ≤150 kB gzipped", () => {
    test.skip(test.info().project.name !== "Desktop Chrome", "static check runs once");
    const indexHtml = readFileSync(path.join(DIST, "index.html"), "utf8");
    // Everything index.html references up front is the initial payload.
    const scripts = [...indexHtml.matchAll(/assets\/[\w.-]+\.js/g)].map((m) => m[0]);
    expect(scripts.length).toBeGreaterThan(0);
    let total = 0;
    for (const script of new Set(scripts)) {
      total += gzipSync(readFileSync(path.join(DIST, script))).byteLength;
    }
    expect(total, `initial JS gzip bytes (${scripts.join(", ")})`).toBeLessThanOrEqual(
      150 * 1024,
    );
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

  test("the dial is draggable within 3 s over throttled 4G", async ({ page }) => {
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
    await expect(page.getByTestId("band")).toBeVisible();
    const elapsed = Date.now() - startedAt;
    expect(elapsed, "ms until the dial is on screen and draggable").toBeLessThan(3000);
  });

  test("the needle answers a drag within a tenth of a second", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("band")).toBeVisible();

    // Scroll the band and measure how long until --tune reflects it. This is
    // the whole per-frame budget: one rAF-throttled listener writing two
    // custom properties (research R4).
    const latency = await page.evaluate(async () => {
      const band = document.querySelector<HTMLElement>('[data-testid="band"]')!;
      const before = getComputedStyle(document.documentElement).getPropertyValue("--tune");
      const startedAt = performance.now();
      band.scrollTo({ left: (band.scrollWidth - band.clientWidth) * 0.5, behavior: "auto" });
      for (;;) {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const now = getComputedStyle(document.documentElement).getPropertyValue("--tune");
        if (now !== before) return performance.now() - startedAt;
        if (performance.now() - startedAt > 2000) return Number.POSITIVE_INFINITY;
      }
    });
    expect(latency, "ms from scroll to --tune update").toBeLessThan(100);
  });

  test("a station is readable within a second of settling", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("band")).toBeVisible();

    const startedAt = Date.now();
    await page.evaluate(() => {
      const band = document.querySelector<HTMLElement>('[data-testid="band"]')!;
      const mark = document.querySelector<HTMLElement>('[data-station-id="the-plaza"]')!;
      band.scrollTo({
        left: mark.offsetLeft + mark.offsetWidth / 2 - band.clientWidth / 2,
        behavior: "auto",
      });
    });
    await expect(page.getByTestId("broadcast")).toContainText("The Plaza");
    expect(Date.now() - startedAt, "ms from settling to readable").toBeLessThan(1000);
  });
});
