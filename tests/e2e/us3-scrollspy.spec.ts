import { expect, test } from "@playwright/test";
import { scrollToStop } from "./helpers";

// FR-015: on screens wide enough to carry it, the navigation says where you are.

test.describe("wide screens", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
  });

  test("lists every stop", async ({ page }) => {
    const nav = page.getByTestId("stop-nav");
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("listitem")).toHaveCount(7);
  });

  test("marks the stop the reader is currently in", async ({ page }) => {
    await scrollToStop(page, "stinson-avenue");
    const current = page.getByTestId("stop-nav").locator('[aria-current="true"]');
    await expect(current).toHaveCount(1);
    await expect(current).toContainText(/Stinson/i);
  });

  test("follows the reader down the page", async ({ page }) => {
    await scrollToStop(page, "our-lady-of-peace");
    await expect(
      page.getByTestId("stop-nav").locator('[aria-current="true"]'),
    ).toContainText(/Our Lady of Peace/i);

    await scrollToStop(page, "britannia-beach");
    await expect(
      page.getByTestId("stop-nav").locator('[aria-current="true"]'),
    ).toContainText(/Britannia Beach/i);
  });

  test("jumps to a stop when a link is used", async ({ page }) => {
    await page.getByTestId("stop-nav").getByRole("link", { name: /McDonald/i }).click();
    await expect(page.locator('[data-stop-id="mcdonalds"]')).toBeInViewport();
  });
});

test("is absent on a phone, where it would only crowd the page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByTestId("stop-nav")).toBeHidden();
});
