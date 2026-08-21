import { expect, test } from "@playwright/test";
import { openRoute, receivedIds, resetStorage, seedReceptions, tuneToStation } from "./helpers";

// User Story 3 (P3): keep it and pass it on.

const ALL = [
  "bells-corners-sign",
  "old-richmond-road",
  "the-school",
  "the-plaza",
  "greenbelt-woods",
  "childhood-street",
];

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await resetStorage(page);
  await page.reload();
  await expect(page.getByTestId("band")).toBeVisible();
});

test("the sign-off offers a keepsake listing the stations in dial order", async ({ page }) => {
  await seedReceptions(page, ALL);
  await openRoute(page, "#/signoff");
  const keepsake = page.getByTestId("keepsake");
  await expect(keepsake).toBeVisible();

  const order = await keepsake.getByTestId("keepsake-station").allInnerTexts();
  expect(order).toHaveLength(6);
  expect(order[0]).toContain("The Bells Corners Sign");
  expect(order[5]).toContain("My Childhood Street");

  // Saving or sharing must be offered, whichever the browser supports.
  await expect(page.getByTestId("keepsake-save")).toBeVisible();
});

test("progress survives a reload", async ({ page }) => {
  await tuneToStation(page, "the-plaza");
  await tuneToStation(page, "the-school");
  await page.reload();
  await expect(page.getByTestId("progress")).toContainText(/2 of 6/);
  expect((await receivedIds(page)).sort()).toEqual(["the-plaza", "the-school"].sort());
});

test("a station link opens that station on a fresh device", async ({ context }) => {
  const fresh = await context.newPage();
  await fresh.goto("/#/station/greenbelt-woods");
  await expect(fresh.getByTestId("broadcast")).toHaveAttribute(
    "data-station-id",
    "greenbelt-woods",
  );
  // The dial is still there around it — a link is an entry point, not a
  // dead end (FR-018).
  await expect(fresh.getByTestId("band")).toBeVisible();
  await fresh.close();
});

test("a link to a station that no longer exists says so and leaves the tour usable", async ({
  page,
}) => {
  await page.goto("/#/station/no-such-place");
  await expect(page.getByText(/not on this dial/i)).toBeVisible();
  await expect(page.getByTestId("band")).toBeVisible();
});

test("the keepsake can be reached again after the tour", async ({ page }) => {
  await seedReceptions(page, ALL);
  await page.reload();
  await page.getByTestId("signoff-link").click();
  await expect(page.getByTestId("keepsake")).toBeVisible();
});
