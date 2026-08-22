import { expect, test } from "@playwright/test";
import { STOP_IDS } from "./helpers";

// The page is nothing but content, so its worst failure is a blank screen —
// exactly what the usual "hide in CSS, reveal with JS" pattern produces when
// scripting fails. This suite is what keeps that from ever being possible
// (research R1, FR-021, contract §4).

test.use({ javaScriptEnabled: false });

test("the whole expedition is in the document with no JavaScript at all", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Bells Corners/);
  await expect(page.getByTestId("hero")).toBeVisible();
  await expect(page.getByTestId("facts")).toContainText(/Duration/i);
  await expect(page.getByTestId("overview")).toBeVisible();
  await expect(page.getByTestId("stop")).toHaveCount(7);
  await expect(page.getByTestId("closing")).toContainText(/Photographs by the author/i);
});

test("no section is left hidden when the reveal can never run", async ({ page }) => {
  await page.goto("/");
  // The reveal styles are scoped to a class only scripting adds, so nothing is
  // hidden and nothing is transparent.
  await expect(page.locator("html")).not.toHaveClass(/\bjs\b/);
  const invisible = await page.evaluate(
    () =>
      [...document.querySelectorAll("[data-testid]")].filter(
        (node) => Number.parseFloat(getComputedStyle(node).opacity) < 0.99,
      ).length,
  );
  expect(invisible, "sections invisible without scripting").toBe(0);
});

test("every stop's story text is present, not just its headline", async ({ page }) => {
  await page.goto("/");
  for (const id of STOP_IDS) {
    const stop = page.locator(`[data-stop-id="${id}"]`);
    await expect(stop).toBeVisible();
    const paragraphs = await stop.locator("p").count();
    expect(paragraphs, `${id} should carry prose`).toBeGreaterThan(1);
  }
});

test("stop links still work — they are ordinary anchors", async ({ page }) => {
  await page.goto("/#our-lady-of-peace");
  await expect(page.locator('[data-stop-id="our-lady-of-peace"]')).toBeInViewport();
});

test("photographs are still served, with their text alternatives", async ({ page }) => {
  await page.goto("/");
  const hero = page.getByTestId("hero").getByRole("img").first();
  await expect(hero).toHaveAttribute("alt", /\S/);
  await expect(hero).toBeVisible();
});
