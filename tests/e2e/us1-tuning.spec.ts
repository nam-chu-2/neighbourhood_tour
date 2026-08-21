import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalScroll,
  flickAcross,
  receivedIds,
  resetStorage,
  tuneBetween,
  tuneToStation,
} from "./helpers";

// User Story 1 (P1): tune the dial and receive the stations.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await resetStorage(page);
  await page.reload();
  await expect(page.getByTestId("band")).toBeVisible();
});

test("opens on the dial with an instruction and nothing tuned in", async ({ page }) => {
  await expect(page.getByRole("listbox", { name: /dial/i })).toBeVisible();
  await expect(page.getByTestId("offstation")).toBeVisible();
  await expect(page.getByTestId("progress")).toContainText(/0 of \d+/);
  await expect(page.getByTestId("broadcast")).toHaveCount(0);
  await expectNoHorizontalScroll(page);
});

test("shows static and no story between stations", async ({ page }) => {
  await tuneBetween(page, "bells-corners-sign", "old-richmond-road");
  await expect(page.getByTestId("offstation")).toBeVisible();
  await expect(page.getByTestId("broadcast")).toHaveCount(0);
  const detune = await page.evaluate(() =>
    Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--detune")),
  );
  expect(detune).toBeGreaterThan(0.9);
});

test("locks a station in when the needle settles on it, with no extra tap", async ({ page }) => {
  await tuneToStation(page, "the-plaza");
  const broadcast = page.getByTestId("broadcast");
  await expect(broadcast).toBeVisible();
  await expect(broadcast).toHaveAttribute("data-station-id", "the-plaza");
  await expect(broadcast).toContainText("The Plaza");
  await expect(broadcast.getByRole("img")).toBeVisible();
  await expect(page.getByTestId("offstation")).toHaveCount(0);
});

test("counts a station as received and keeps its mark distinct", async ({ page }) => {
  await tuneToStation(page, "the-school");
  await expect(page.getByTestId("progress")).toContainText(/1 of \d+/);
  expect(await receivedIds(page)).toEqual(["the-school"]);
});

test("a station flown past at speed is not received", async ({ page }) => {
  await flickAcross(page);
  // The flick ends between stations, so nothing it passed may be received.
  await page.waitForTimeout(400);
  expect(await receivedIds(page)).toEqual([]);
  await expect(page.getByTestId("progress")).toContainText(/0 of \d+/);
});

test("re-tuning a received station reopens it without double-counting", async ({ page }) => {
  await tuneToStation(page, "the-plaza");
  await tuneToStation(page, "greenbelt-woods");
  await tuneToStation(page, "the-plaza");
  await expect(page.getByTestId("broadcast")).toHaveAttribute("data-station-id", "the-plaza");
  await expect(page.getByTestId("progress")).toContainText(/2 of \d+/);
});

test("stays within the band at both ends", async ({ page }) => {
  await tuneToStation(page, "bells-corners-sign");
  const atStart = await page.evaluate(
    () => document.querySelector<HTMLElement>('[data-testid="band"]')!.scrollLeft,
  );
  expect(atStart).toBeGreaterThanOrEqual(0);
  await tuneToStation(page, "childhood-street");
  const { left, max } = await page.evaluate(() => {
    const band = document.querySelector<HTMLElement>('[data-testid="band"]')!;
    return { left: band.scrollLeft, max: band.scrollWidth - band.clientWidth };
  });
  expect(left).toBeLessThanOrEqual(max + 1);
});

test("adapts to a desktop-sized viewport without losing the dial", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await tuneToStation(page, "the-plaza");
  await expect(page.getByTestId("broadcast")).toBeVisible();
  await expect(page.getByTestId("band")).toBeVisible();
  await expectNoHorizontalScroll(page);
});
