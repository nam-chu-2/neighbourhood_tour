import { expect, test } from "@playwright/test";
import { resetStorage, tuneToStation } from "./helpers";

// User Story 2 (P2): the tour must be complete with motion minimised and with
// sound off — the two settings that must never cost content (FR-014, FR-015).

test.describe("reduced motion", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("offers a stepper instead of a flight down the band", async ({ page }) => {
    await page.goto("/");
    await resetStorage(page);
    await page.reload();
    const stepper = page.getByTestId("stepper");
    await expect(stepper).toBeVisible();

    await stepper.getByRole("button", { name: /start tuning/i }).click();
    await expect(page.getByTestId("broadcast")).toHaveAttribute(
      "data-station-id",
      "bells-corners-sign",
    );

    await stepper.getByRole("button", { name: /next station/i }).click();
    await expect(page.getByTestId("broadcast")).toHaveAttribute(
      "data-station-id",
      "old-richmond-road",
    );
    await stepper.getByRole("button", { name: /previous station/i }).click();
    await expect(page.getByTestId("broadcast")).toHaveAttribute(
      "data-station-id",
      "bells-corners-sign",
    );
  });

  test("stops the grain moving but keeps the off-station state legible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("offstation")).toBeVisible();
    const animation = await page.evaluate(() => {
      const grain = document.querySelector(".static__grain");
      return grain ? getComputedStyle(grain).animationName : "missing";
    });
    expect(animation).toBe("none");
  });

  test("every station is still reachable", async ({ page }) => {
    await page.goto("/");
    await resetStorage(page);
    await page.reload();
    await page.getByTestId("guide").click();
    await expect(page.getByRole("listitem")).toHaveCount(6);
  });
});

test.describe("sound", () => {
  test.beforeEach(async ({ page }) => {
    // Count AudioContext constructions so "off by default" is a fact, not a
    // claim about the UI (contract §7).
    await page.addInitScript(() => {
      const w = window as unknown as { __audioContexts: number; AudioContext?: unknown };
      w.__audioContexts = 0;
      const Original = window.AudioContext;
      if (!Original) return;
      class Counted extends Original {
        constructor(options?: AudioContextOptions) {
          super(options);
          w.__audioContexts += 1;
        }
      }
      w.AudioContext = Counted;
    });
    await page.goto("/");
    await resetStorage(page);
    await page.reload();
  });

  const contexts = (page: import("@playwright/test").Page) =>
    page.evaluate(() => (window as unknown as { __audioContexts: number }).__audioContexts);

  test("is off by default and creates no audio context until asked", async ({ page }) => {
    await expect(page.getByTestId("sound-toggle")).toHaveAttribute("aria-pressed", "false");
    await tuneToStation(page, "the-plaza");
    await tuneToStation(page, "the-school");
    expect(await contexts(page)).toBe(0);
  });

  test("turns on and off from one control", async ({ page }) => {
    const toggle = page.getByTestId("sound-toggle");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(await contexts(page)).toBe(1);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  test("remembers the preference", async ({ page }) => {
    await page.getByTestId("sound-toggle").click();
    await page.reload();
    await expect(page.getByTestId("sound-toggle")).toHaveAttribute("aria-pressed", "true");
  });

  test("the whole tour works in silence", async ({ page }) => {
    for (const id of [
      "bells-corners-sign",
      "old-richmond-road",
      "the-school",
      "the-plaza",
      "greenbelt-woods",
      "childhood-street",
    ]) {
      await tuneToStation(page, id);
      await expect(page.getByTestId("broadcast")).toHaveAttribute("data-station-id", id);
    }
    await expect(page.getByTestId("progress")).toContainText(/6 of 6/);
    expect(await contexts(page)).toBe(0);
  });
});
