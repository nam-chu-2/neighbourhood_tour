import { expect, test } from "@playwright/test";
import { scrollTo, scrollToStop } from "./helpers";

// User Story 2 (P2): the craft that has to carry the page now the mechanic is
// gone — pacing, the drawn route, and legible text over photography.

test("sections settle into place as they are scrolled to", async ({ page }) => {
  await page.goto("/");
  const overview = page.getByTestId("overview");
  // Below the fold at load, so it starts hidden…
  await expect(overview).toHaveAttribute("data-revealed", "hidden");
  await scrollTo(page, "overview");
  // …and finishes revealed once seen.
  await expect(overview).toHaveAttribute("data-revealed", "revealed");
});

test("a reveal happens once and never reverses", async ({ page }) => {
  await page.goto("/");
  await scrollToStop(page, "stinson-avenue");
  const stop = page.locator('[data-stop-id="stinson-avenue"]');
  await expect(stop).toHaveAttribute("data-revealed", "revealed");

  await page.getByTestId("hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  // Scrolling away must not un-reveal it — reveals are one-shot.
  await expect(stop).toHaveAttribute("data-revealed", "revealed");
});

test("the route draws itself when it comes into view", async ({ page }) => {
  await page.goto("/");
  await scrollTo(page, "route");
  await expect(page.getByTestId("route")).toHaveAttribute("data-revealed", "revealed");
  // The draw runs for --motion-draw; wait for it to finish rather than racing it.
  await page.waitForTimeout(1600);

  const offset = await page
    .getByTestId("route")
    .locator(".route__line")
    .evaluate((line) => getComputedStyle(line).strokeDashoffset);
  // Finished drawing: the dash offset has returned to zero.
  expect(Number.parseFloat(offset)).toBeLessThan(0.01);
});

test("the display serif is actually used for headlines", async ({ page }) => {
  await page.goto("/");
  const family = await page
    .getByRole("heading", { level: 1 })
    .evaluate((node) => getComputedStyle(node).fontFamily);
  expect(family).toMatch(/Fraunces/i);
});

test("nothing is fetched from another origin — not even the font", async ({ page, baseURL }) => {
  // FR-018: no external or paid service at runtime. The display serif is
  // served from this site's own assets, which is also what keeps it working
  // offline (research R7).
  const origin = new URL(baseURL ?? "http://localhost:4173").origin;
  const external: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== origin && url.protocol !== "data:") external.push(url.href);
  });

  await page.goto("/");
  await page.getByTestId("closing").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  expect(external, "the page must make no external request").toEqual([]);

  // And the font really is loaded, from here.
  const fontRequests = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => name.endsWith(".woff2")),
  );
  expect(fontRequests.length, "the vendored font should load").toBeGreaterThan(0);
  for (const request of fontRequests) expect(request).toContain("/fonts/");
});
