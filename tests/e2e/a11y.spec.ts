import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { openRoute, resetStorage, seedReceptions, tuneToStation } from "./helpers";

// Baseline accessibility across every surface of the radio (FR-021, SC-006).

const scan = async (page: import("@playwright/test").Page) =>
  new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await resetStorage(page);
  await page.reload();
  await expect(page.getByTestId("band")).toBeVisible();
});

test("the dial, off-station, has no violations", async ({ page }) => {
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("an open broadcast has no violations", async ({ page }) => {
  await tuneToStation(page, "the-plaza");
  await expect(page.getByTestId("broadcast")).toBeVisible();
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("the station guide has no violations", async ({ page }) => {
  await page.getByTestId("guide").click();
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("the sign-off and keepsake have no violations", async ({ page }) => {
  await seedReceptions(page, [
    "bells-corners-sign",
    "old-richmond-road",
    "the-school",
    "the-plaza",
    "greenbelt-woods",
    "childhood-street",
  ]);
  await openRoute(page, "#/signoff");
  await expect(page.getByTestId("signoff")).toBeVisible();
  const results = await scan(page);
  expect(results.violations).toEqual([]);
});

test("every visual carries a text alternative", async ({ page }) => {
  await tuneToStation(page, "the-school");
  const images = page.getByTestId("broadcast").getByRole("img");
  const count = await images.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i += 1) {
    await expect(images.nth(i)).toHaveAttribute("alt", /\S/);
  }
});
