import { expect, test } from "@playwright/test";
import { scrollTo } from "./helpers";

// FR-012 / SC-006: with motion minimised the page is complete and still — and,
// critically, nothing is missing.

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("no section is ever left in a hidden state", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("closing").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const hidden = await page.locator('[data-revealed="hidden"]').count();
  expect(hidden, "sections hidden under reduced motion").toBe(0);
});

test("nothing animates", async ({ page }) => {
  await page.goto("/");
  await scrollTo(page, "overview");
  const transition = await page
    .getByTestId("overview")
    .evaluate((node) => getComputedStyle(node).transitionDuration);
  // The global reduced-motion block collapses transitions to a microsecond.
  expect(Number.parseFloat(transition)).toBeLessThan(0.01);
});

test("the route is already drawn", async ({ page }) => {
  await page.goto("/");
  await scrollTo(page, "route");
  const offset = await page
    .getByTestId("route")
    .locator(".route__line")
    .evaluate((line) => getComputedStyle(line).strokeDashoffset);
  expect(Number.parseFloat(offset)).toBeLessThan(0.01);
});

test("every word of the page is still there", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("stop")).toHaveCount(7);
  await expect(page.getByTestId("facts")).toContainText(/Duration/i);
  await expect(page.getByTestId("closing")).toContainText(/Photographs by the author/i);
});
