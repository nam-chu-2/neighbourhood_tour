import { expect, type Page } from "@playwright/test";

// Shared Playwright helpers. The dial is a scroll container, so the tests
// drive it the way a thumb does — by scrolling it — rather than by calling
// application code (contract §10).

export const SETTLE_MS = 260;

/** Wipe the visitor's saved progress so a test starts fresh. */
export async function resetStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
    } catch {
      // Nothing stored is nothing to clear.
    }
  });
}

/** Seed received stations so a test can start mid-tour. Reload afterwards. */
export async function seedReceptions(page: Page, stationIds: string[]): Promise<void> {
  await page.evaluate((ids) => {
    const at = new Date().toISOString();
    window.localStorage.setItem(
      "bells-corners-radio:v1",
      JSON.stringify({
        version: 1,
        soundOn: false,
        receptions: ids.map((stationId) => ({ stationId, at })),
        startedAt: at,
      }),
    );
  }, stationIds);
}

/**
 * Open a route with a real page load. Changing only the hash is a
 * same-document navigation, so the running app would answer with the state it
 * loaded with — and, for #/signoff, redirect away before seeded progress is
 * ever read. A unique query string forces an actual load.
 */
export async function openRoute(page: Page, hash: string): Promise<void> {
  await page.goto(`/?fresh=${Date.now()}${hash}`);
}

/** How far along the band (0–1) the needle currently sits. */
export async function tuneValue(page: Page): Promise<number> {
  return page.evaluate(() =>
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--tune") || "0",
    ),
  );
}

/** Scroll the band to a fraction of its travel and let it settle. */
export async function tuneToFraction(page: Page, fraction: number): Promise<void> {
  await page.evaluate((f) => {
    const band = document.querySelector<HTMLElement>('[data-testid="band"]');
    if (!band) throw new Error("no band");
    band.scrollTo({ left: (band.scrollWidth - band.clientWidth) * f, behavior: "auto" });
  }, fraction);
  await page.waitForTimeout(SETTLE_MS);
}

/** Centre the needle on a station the way a settling flick would. */
export async function tuneToStation(page: Page, stationId: string): Promise<void> {
  await page.evaluate((id) => {
    const band = document.querySelector<HTMLElement>('[data-testid="band"]');
    const mark = document.querySelector<HTMLElement>(`[data-station-id="${id}"]`);
    if (!band || !mark) throw new Error(`no band or station ${id}`);
    const target = mark.offsetLeft + mark.offsetWidth / 2 - band.clientWidth / 2;
    band.scrollTo({ left: target, behavior: "auto" });
  }, stationId);
  await page.waitForTimeout(SETTLE_MS);
}

/** Park the needle between two stations, where the static lives. */
export async function tuneBetween(page: Page, firstId: string, secondId: string): Promise<void> {
  await page.evaluate(
    ({ firstId, secondId }) => {
      const band = document.querySelector<HTMLElement>('[data-testid="band"]');
      const a = document.querySelector<HTMLElement>(`[data-station-id="${firstId}"]`);
      const b = document.querySelector<HTMLElement>(`[data-station-id="${secondId}"]`);
      if (!band || !a || !b) throw new Error("no band or stations");
      const centre = (mark: HTMLElement) => mark.offsetLeft + mark.offsetWidth / 2;
      band.scrollTo({
        left: (centre(a) + centre(b)) / 2 - band.clientWidth / 2,
        behavior: "auto",
      });
    },
    { firstId, secondId },
  );
  await page.waitForTimeout(SETTLE_MS);
}

/**
 * Fly the needle across the band without ever letting it settle — the flick
 * that must leave every station it passes unreceived.
 */
export async function flickAcross(page: Page, steps = 12): Promise<void> {
  await page.evaluate(async (count) => {
    const band = document.querySelector<HTMLElement>('[data-testid="band"]');
    if (!band) throw new Error("no band");
    const travel = band.scrollWidth - band.clientWidth;
    for (let i = 1; i <= count; i += 1) {
      band.scrollTo({ left: (travel * i) / count, behavior: "auto" });
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }, steps);
}

export async function receivedIds(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('[data-testid="station-mark"]')]
      .filter((mark) => mark.dataset.received === "true")
      .map((mark) => mark.dataset.stationId ?? ""),
  );
}

/** FR-016: the page itself must never scroll horizontally. */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);
}
