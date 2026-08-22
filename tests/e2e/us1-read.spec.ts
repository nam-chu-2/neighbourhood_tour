import { expect, test } from "@playwright/test";
import { STOP_IDS, expectNoHorizontalScroll, scrollToStop, sectionOrder } from "./helpers";

// User Story 1 (P1): read the expedition.

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("hero")).toBeVisible();
});

test("opens on a full-bleed photograph with the title over it", async ({ page }) => {
  const hero = page.getByTestId("hero");
  await expect(hero.getByRole("heading", { level: 1 })).toHaveText(/Bells Corners/);
  await expect(hero.getByRole("img")).toBeVisible();
  await expect(hero).toContainText(/Twenty-five minutes west/);
  await expectNoHorizontalScroll(page);
});

test("presents the sections in the order the contract fixes", async ({ page }) => {
  const order = await sectionOrder(page);
  expect(order.slice(0, 4)).toEqual(["hero", "facts", "overview", "route"]);
  expect(order.filter((id) => id === "stop")).toHaveLength(7);
  expect(order[order.length - 1]).toBe("closing");
});

test("states the duration, the distance and the number of stops", async ({ page }) => {
  const facts = page.getByTestId("facts");
  await expect(facts).toContainText(/Duration/i);
  await expect(facts).toContainText(/Distance/i);
  await expect(facts).toContainText(/Stops/i);
  await expect(facts).toContainText(/\d+ minutes/);
});

test("frames the place for someone who only knows downtown", async ({ page }) => {
  await expect(page.getByTestId("overview")).toContainText(/About this journey/i);
});

test("presents seven numbered stops in itinerary order", async ({ page }) => {
  const stops = page.getByTestId("stop");
  await expect(stops).toHaveCount(7);
  const ids = await stops.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-stop-id")),
  );
  expect(ids).toEqual(STOP_IDS);
});

test("each stop carries its number, headline, photograph and story", async ({ page }) => {
  await scrollToStop(page, "our-lady-of-peace");
  const stop = page.locator('[data-stop-id="our-lady-of-peace"]');
  await expect(stop).toContainText("04");
  await expect(stop.getByRole("heading", { level: 2 })).toContainText("Our Lady of Peace");
  await expect(stop.getByRole("img").first()).toBeVisible();
  await expect(stop.locator("p")).not.toHaveCount(0);
  await expect(stop).toContainText(/If you only know downtown/i);
});

test("ends with a closing note and the credits", async ({ page }) => {
  const closing = page.getByTestId("closing");
  await closing.scrollIntoViewIfNeeded();
  await expect(closing).toBeVisible();
  await expect(closing).toContainText(/Photographs by the author/i);
});

test("asks the reader to do nothing at all", async ({ page }) => {
  // Read-only: no progress, no unlocking, no audio anywhere (FR-008, FR-009).
  await expect(page.locator("audio, video")).toHaveCount(0);
  await expect(page.getByText(/received|unlock|progress/i)).toHaveCount(0);
  const stored = await page.evaluate(() => window.localStorage.length);
  expect(stored, "the page must store nothing").toBe(0);
});

test("adapts to a desktop viewport without losing anything", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByTestId("stop")).toHaveCount(7);
  await expectNoHorizontalScroll(page);
});

test("adapts to landscape on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByTestId("hero")).toBeVisible();
  await expectNoHorizontalScroll(page);
});
