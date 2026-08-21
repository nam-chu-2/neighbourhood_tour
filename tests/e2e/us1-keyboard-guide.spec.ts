import { expect, test } from "@playwright/test";
import { receivedIds, resetStorage } from "./helpers";

// User Story 1 (P1), scenarios 7–9: the tour must be completable without
// dragging, and understandable without sound (FR-010, FR-021, SC-007).

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await resetStorage(page);
  await page.reload();
  await expect(page.getByTestId("band")).toBeVisible();
});

test("a focused station locks in immediately, with no settle wait", async ({ page }) => {
  const marks = page.getByTestId("station-mark");
  await marks.first().focus();
  await expect(page.getByTestId("broadcast")).toHaveAttribute(
    "data-station-id",
    "bells-corners-sign",
  );
});

test("arrow keys move along the band and receive each station", async ({ page }) => {
  await page.getByTestId("station-mark").first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("broadcast")).toHaveAttribute(
    "data-station-id",
    "old-richmond-road",
  );
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByTestId("broadcast")).toHaveAttribute(
    "data-station-id",
    "bells-corners-sign",
  );
  expect((await receivedIds(page)).sort()).toEqual(
    ["bells-corners-sign", "old-richmond-road"].sort(),
  );
});

test("Home and End reach the ends of the band", async ({ page }) => {
  await page.getByTestId("station-mark").first().focus();
  await page.keyboard.press("End");
  await expect(page.getByTestId("broadcast")).toHaveAttribute(
    "data-station-id",
    "childhood-street",
  );
  await page.keyboard.press("Home");
  await expect(page.getByTestId("broadcast")).toHaveAttribute(
    "data-station-id",
    "bells-corners-sign",
  );
});

test("the station guide lists every station and opens any of them", async ({ page }) => {
  await page.getByTestId("guide").click();
  const items = page.getByRole("listitem");
  await expect(items).toHaveCount(6);
  await page.getByRole("link", { name: /the plaza/i }).click();
  await expect(page.getByTestId("broadcast")).toHaveAttribute("data-station-id", "the-plaza");
});

test("the whole tour can be completed by keyboard alone, in silence", async ({ page }) => {
  await page.getByTestId("station-mark").first().focus();
  for (let i = 0; i < 5; i += 1) await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("progress")).toContainText(/6 of 6/);
  // Silent parity: nothing was ever turned on, and the tour still completed.
  await expect(page.getByTestId("sound-toggle")).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByTestId("signoff-link")).toBeVisible();
});
