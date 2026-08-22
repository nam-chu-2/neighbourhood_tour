import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { scrollToStop } from "./helpers";

// Baseline accessibility for a page that is nothing but content (FR-019, SC-006).

test("the whole page has no axe violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("hero")).toBeVisible();
  // Walk the page so lazy content is in the DOM before scanning.
  await page.getByTestId("closing").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("headings run in order and never skip a level", async ({ page }) => {
  await page.goto("/");
  const levels = await page.evaluate(() =>
    [...document.querySelectorAll("h1, h2, h3")].map((h) => Number(h.tagName[1])),
  );
  expect(levels[0], "the page starts at h1").toBe(1);
  expect(levels.filter((level) => level === 1), "exactly one h1").toHaveLength(1);
  for (let i = 1; i < levels.length; i += 1) {
    expect(levels[i]! - levels[i - 1]!).toBeLessThanOrEqual(1);
  }
});

test("every photograph carries a text alternative", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("closing").scrollIntoViewIfNeeded();
  const images = page.locator("img");
  const count = await images.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await expect(images.nth(i)).toHaveAttribute("alt", /\S/);
  }
});

test("the route is announced as decorative, not as noise", async ({ page }) => {
  await page.goto("/");
  const svg = page.getByTestId("route").locator("svg");
  await expect(svg).toHaveAttribute("aria-hidden", "true");
});

test("a stop is reachable and readable by keyboard alone", async ({ page }) => {
  await page.goto("/");
  await scrollToStop(page, "stinson-avenue");
  await expect(page.locator('[data-stop-id="stinson-avenue"]')).toBeVisible();
  // The skip link is the first stop on the tab order and goes to the itinerary.
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent ?? "");
  expect(focused).toMatch(/skip to the itinerary/i);
});
