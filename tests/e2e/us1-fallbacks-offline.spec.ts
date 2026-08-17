import { expect, test } from "@playwright/test";
import { tour } from "../../src/content/tour";
import {
  confirmProposal,
  expectNoHorizontalScroll,
  placeFixture,
  snap,
} from "./helpers";

const places = [...tour.places].sort((a, b) => a.order - b.order);
const p1 = places[0]!;
const N = places.length;

// FR-005: camera denied/unavailable/cancelled must explain itself and still
// let the visitor mark the place found so the tour continues.
test.describe("camera unavailable", () => {
  test("explains and offers a no-photo find", async ({ page }) => {
    // Simulate the native camera being dismissed/denied: the file input's
    // click never opens a chooser, it fires `cancel` instead.
    await page.addInitScript(() => {
      const original = HTMLInputElement.prototype.click;
      HTMLInputElement.prototype.click = function () {
        if (this.type === "file") {
          setTimeout(() => this.dispatchEvent(new Event("cancel")), 0);
          return;
        }
        original.call(this);
      };
    });

    await page.goto("/");
    await page.getByRole("link", { name: /start the ride/i }).click();
    await page.getByRole("button", { name: /snap/i }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Plain-language explanation, not an error code (Constitution IV).
    await expect(dialog.getByText(/no photo was taken|camera/i).first()).toBeVisible();
    // Both continue paths exist: mark the proposed place, or pick another.
    await expect(
      dialog.getByRole("button", { name: /pick a different place/i }),
    ).toBeVisible();
    await dialog
      .getByRole("button", { name: new RegExp(`mark .* found without a photo`, "i") })
      .click();

    // The proposed (first) place is found with no photo; the tour continues.
    await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
    await expect(page.getByText(/no photo/i).first()).toBeVisible();
    await page.getByRole("link", { name: /back to the route/i }).click();
    await expect(page.getByText(`1 of ${N} found`)).toBeVisible();
  });
});

// FR-012 / SC-007: after one load, everything works with connectivity cut.
// Playwright's offline emulation is only dependable on Chromium.
test.describe("offline after first load", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Chromium-only emulation");

  test("the whole flow keeps working with the network cut", async ({ page, context }) => {
    await page.goto("/");
    // The service worker precache must finish before we cut the cord.
    await expect(page.getByText(/ready for the road/i)).toBeVisible({
      timeout: 20_000,
    });

    await context.setOffline(true);
    await page.reload();

    // App shell loads from the precache — no error page (SC-007).
    await expect(page.getByRole("heading", { name: tour.title })).toBeVisible();
    await page.getByRole("link", { name: /start the ride/i }).click();
    await expect(page.getByText(`0 of ${N} found`)).toBeVisible();

    // Snap → propose → confirm → read, all with no network (FR-003).
    await snap(page, placeFixture(p1.id));
    await expect(
      page.getByRole("heading", { name: `Is this ${p1.name}?` }),
    ).toBeVisible();
    await confirmProposal(page);
    await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
    await expect(page.getByText(p1.story.slice(0, 40))).toBeVisible();

    await context.setOffline(false);
  });
});

// FR-003b / FR-015 (T054): the site must never call out — no external or
// paid service, no analytics, nothing. Any request leaving the origin during
// a full pass through the app is a failure.
test("no request leaves the origin at runtime", async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on("request", (request) => {
    const url = request.url();
    const internal =
      url.startsWith(baseURL!) || url.startsWith("data:") || url.startsWith("blob:");
    if (!internal) external.push(url);
  });

  await page.goto("/");
  await page.getByRole("link", { name: /start the ride/i }).click();
  await snap(page, placeFixture(p1.id));
  await confirmProposal(page);
  await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
  await page.getByRole("link", { name: /back to the route/i }).click();
  await page.getByRole("link", { name: /your ride so far/i }).click();
  await expect(page.getByRole("heading", { name: /your ride/i })).toBeVisible();

  expect(external).toEqual([]);
});

// FR-010: the same site adapts to a desktop width with no loss of content.
test.describe("desktop layout", () => {
  test.skip(({ isMobile }) => !!isMobile, "desktop-only check");

  test("tour screen adapts side-by-side with all content present", async ({ page }) => {
    await page.goto("/#/tour");
    await expect(page.getByText(`0 of ${N} found`)).toBeVisible();
    await expect(page.getByRole("button", { name: /snap/i })).toBeVisible();
    // Every place is listed and the route map is present.
    for (const place of places) {
      await expect(page.getByText(place.name).first()).toBeVisible();
    }
    await expect(page.getByRole("group", { name: /route map/i })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
