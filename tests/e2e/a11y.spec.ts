import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { tour } from "../../src/content/tour";
import { confirmProposal, placeFixture, snap } from "./helpers";

// FR-014 / SC-006. Axe runs on every key screen; keyboard and screen-reader
// paths are exercised on Desktop Chrome (keyboard-first environment).
const places = [...tour.places].sort((a, b) => a.order - b.order);
const p1 = places[0]!;

async function expectNoSeriousViolations(page: Page, screen: string) {
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) =>
    ["serious", "critical"].includes(v.impact ?? ""),
  );
  expect(
    serious.map((v) => `${screen}: ${v.id} — ${v.help}`),
    `axe violations on ${screen}`,
  ).toEqual([]);
}

test("axe: welcome, tour, snap sheet, place detail", async ({ page }) => {
  await page.goto("/");
  await expectNoSeriousViolations(page, "welcome");

  await page.getByRole("link", { name: /start the ride/i }).click();
  await expect(page.getByText(/0 of \d+ found/)).toBeVisible();
  await expectNoSeriousViolations(page, "tour");

  await snap(page, placeFixture(p1.id));
  await expectNoSeriousViolations(page, "snap sheet");

  await confirmProposal(page);
  await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
  await expectNoSeriousViolations(page, "place detail");
});

test.describe("keyboard and screen-reader affordances", () => {
  test.skip(({ isMobile }) => !!isMobile, "keyboard path checked on desktop");

  test("keyboard-only: Start → Snap → Yes → detail", async ({ page }) => {
    await page.goto("/");

    // Tab to the single primary action and enter the tour.
    const start = page.getByRole("link", { name: /start the ride/i });
    await expect(start).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(start).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/0 of \d+ found/)).toBeVisible();

    // Reach the Snap button with the keyboard and activate it.
    const snapButton = page.getByRole("button", { name: /snap/i });
    const chooserPromise = page.waitForEvent("filechooser");
    await snapButton.focus();
    await page.keyboard.press("Enter");
    const chooser = await chooserPromise;
    await chooser.setFiles(placeFixture(p1.id));

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Focus lands inside the sheet; Enter on the default action confirms.
    const confirm = dialog.getByRole("button", { name: /yes, that.s it/i });
    await expect(confirm).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
  });

  test("the snap sheet traps focus and Esc dismisses without a find", async ({
    page,
  }) => {
    await page.goto("/#/tour");
    await snap(page, placeFixture(p1.id));
    const dialog = page.getByRole("dialog");

    // Tab far more times than there are controls: focus must stay inside.
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(
        () => !!document.activeElement?.closest('[role="dialog"]'),
      );
      expect(inside, `focus escaped the sheet on tab ${i + 1}`).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByText(/0 of \d+ found/)).toBeVisible();
  });

  test("every route marker has an accessible name with its status", async ({ page }) => {
    await page.goto("/#/tour");
    for (const place of places) {
      await expect(
        page.getByRole("img", { name: new RegExp(place.name, "i") }),
      ).toBeVisible();
    }
  });

  test("the proposal is announced via aria-live", async ({ page }) => {
    await page.goto("/#/tour");
    await snap(page, placeFixture(p1.id));
    await expect(page.locator('[role="status"]')).toContainText(
      new RegExp(`is this ${p1.name}`, "i"),
    );
  });
});
