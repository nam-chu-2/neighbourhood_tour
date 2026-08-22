import { expect, test } from "@playwright/test";

// User Story 3 (P3): find a stop, and pass the page on.

test("a stop link lands on that stop, clear of the top edge", async ({ page }) => {
  await page.goto("/#our-lady-of-peace");
  const stop = page.locator('[data-stop-id="our-lady-of-peace"]');
  await expect(stop).toBeInViewport();

  const top = await stop.evaluate((node) => node.getBoundingClientRect().top);
  // scroll-margin-top keeps it off the very edge (FR-014).
  expect(top).toBeGreaterThan(0);
});

test("the rest of the expedition is still above and below it", async ({ page }) => {
  await page.goto("/#mcdonalds");
  await expect(page.getByTestId("stop")).toHaveCount(7);
  await expect(page.getByTestId("hero")).toHaveCount(1);
  await expect(page.getByTestId("closing")).toHaveCount(1);
});

test("an unknown anchor loads the page and reads normally", async ({ page }) => {
  await page.goto("/#no-such-stop");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("stop")).toHaveCount(7);
  await expect(page.getByText(/error|not found/i)).toHaveCount(0);
});

test("the share control offers to share or copy the link", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  const share = page.getByTestId("share");
  await share.scrollIntoViewIfNeeded();
  await expect(share).toBeVisible();
  await share.click();

  // Either the browser took over the share, or we copied — both are success.
  const copied = await page.evaluate(() => navigator.clipboard.readText().catch(() => ""));
  const note = await page.getByTestId("closing").textContent();
  expect(copied.includes("localhost") || /copied|address bar/i.test(note ?? "")).toBe(true);
});
