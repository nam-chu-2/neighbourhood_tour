import { expect, test } from "@playwright/test";
import { blockImages } from "./helpers";

// FR-017 / FR-021 / SC-007: the page survives losing the network, and survives
// losing its photographs.

test("the whole page still renders with the network cut", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByTestId("hero")).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 15_000,
  });

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("stop")).toHaveCount(7);
  await expect(page.getByTestId("closing")).toBeVisible();
  await expect(page.getByText(/you are offline|no internet/i)).toHaveCount(0);

  await context.setOffline(false);
});

test("photographs are served offline too, not just the text", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 15_000,
  });
  await context.setOffline(true);
  await page.reload();

  const heroLoaded = await page
    .getByTestId("hero")
    .getByRole("img")
    .first()
    .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
  expect(heroLoaded, "the hero photograph should come from the precache").toBe(true);

  await context.setOffline(false);
});

test("a stop link still works offline", async ({ page, context }) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 15_000,
  });
  await context.setOffline(true);
  await page.goto("/#stinson-avenue");
  await expect(page.locator('[data-stop-id="stinson-avenue"]')).toBeInViewport();
  await context.setOffline(false);
});

test("with every image blocked, the page still reads", async ({ page }) => {
  await blockImages(page);
  await page.goto("/");

  // FR-021: the stories survive without the photography — which is also what
  // reader modes and printing see.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("stop")).toHaveCount(7);
  await expect(page.getByTestId("facts")).toContainText(/Duration/i);
  await expect(page.locator('[data-stop-id="our-lady-of-peace"]')).toContainText(/peace/i);

  // And the layout does not collapse: the page is still taller than the screen.
  const height = await page.evaluate(() => document.body.scrollHeight);
  expect(height).toBeGreaterThan(1000);
});
