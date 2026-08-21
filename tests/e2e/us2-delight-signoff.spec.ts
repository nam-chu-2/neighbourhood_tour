import { expect, test } from "@playwright/test";
import { openRoute, resetStorage, seedReceptions, tuneToStation } from "./helpers";

// User Story 2 (P2): the analog feel, and an ending.

const ALL = [
  "bells-corners-sign",
  "old-richmond-road",
  "the-school",
  "the-plaza",
  "greenbelt-woods",
  "childhood-street",
];

const backgroundOf = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await resetStorage(page);
  await page.reload();
  await expect(page.getByTestId("band")).toBeVisible();
});

test("the palette travels visibly from one end of the band to the other", async ({ page }) => {
  await tuneToStation(page, "bells-corners-sign");
  const atStart = await backgroundOf(page);
  await tuneToStation(page, "childhood-street");
  const atEnd = await backgroundOf(page);
  expect(atStart).not.toBe(atEnd);
});

test("the palette moves continuously, not in one jump at the end", async ({ page }) => {
  await tuneToStation(page, "bells-corners-sign");
  const first = await backgroundOf(page);
  await tuneToStation(page, "the-school");
  const middle = await backgroundOf(page);
  await tuneToStation(page, "childhood-street");
  const last = await backgroundOf(page);
  expect(new Set([first, middle, last]).size).toBe(3);
});

test("the needle sharpens as the station comes in", async ({ page }) => {
  const detune = () =>
    page.evaluate(() =>
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--detune"),
      ),
    );
  await tuneToStation(page, "the-plaza");
  expect(await detune()).toBeLessThan(0.2);
});

test("the sign-off closes the tour and names what was received", async ({ page }) => {
  await seedReceptions(page, ALL);
  await page.reload();
  await page.getByTestId("signoff-link").click();
  const signoff = page.getByTestId("signoff");
  await expect(signoff).toBeVisible();
  for (const name of ["The Plaza", "My Childhood Street", "The Greenbelt Woods"]) {
    await expect(signoff).toContainText(name);
  }
});

test("the sign-off is not reachable before the tour is complete", async ({ page }) => {
  await seedReceptions(page, ALL.slice(0, 3));
  await openRoute(page, "#/signoff");
  await expect(page.getByTestId("signoff")).toHaveCount(0);
  await expect(page.getByTestId("band")).toBeVisible();
});

test("receiving the last station is what unlocks the sign-off", async ({ page }) => {
  await seedReceptions(page, ALL.slice(0, 5));
  await page.reload();
  await expect(page.getByTestId("signoff-link")).toHaveCount(0);
  await tuneToStation(page, "childhood-street");
  await expect(page.getByTestId("signoff-link")).toBeVisible();
});
