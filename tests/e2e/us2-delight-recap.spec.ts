import { expect, test } from "@playwright/test";
import { tour } from "../../src/content/tour";
import { confirmProposal, placeFixture, seedFinds, snap } from "./helpers";

// US2: finding a place is a moment (FR-011), and the visitor keeps a recap
// of their own photos (FR-009).

const places = [...tour.places].sort((a, b) => a.order - b.order);
const p1 = places[0]!;
const N = places.length;

test("confirming a find advances the route and reveals the detail within a second", async ({
  page,
}) => {
  await page.goto("/#/tour");
  await snap(page, placeFixture(p1.id));

  const confirmedAt = Date.now();
  await confirmProposal(page);
  await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
  expect(Date.now() - confirmedAt).toBeLessThan(1000);

  // Back on the route, the marker is visibly (and accessibly) found.
  await page.getByRole("link", { name: /back to the route/i }).click();
  await expect(
    page.getByRole("img", { name: new RegExp(`${p1.name} — found`, "i") }),
  ).toBeVisible();
});

test("reduced motion: identical content, no animation attributes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/tour");
  await snap(page, placeFixture(p1.id));
  await confirmProposal(page);
  await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
  await expect(page.getByText(p1.story.slice(0, 40))).toBeVisible();

  await page.getByRole("link", { name: /back to the route/i }).click();
  await expect(page.getByText(`1 of ${N} found`)).toBeVisible();
  // The JS animation gate honours the preference: nothing is marked animating.
  await expect(page.locator("[data-animating]")).toHaveCount(0);
  await expect(page.locator("[data-pop]")).toHaveCount(0);
});

test("full recap: every photo in route order, saved via Web Share", async ({ page }) => {
  await page.addInitScript(() => {
    const nav = navigator as Navigator & {
      canShare?: (data?: unknown) => boolean;
      share?: (data?: { files?: File[] }) => Promise<void>;
    };
    nav.canShare = () => true;
    nav.share = (data) => {
      (window as Window & { __sharedFiles?: number }).__sharedFiles =
        data?.files?.length ?? 0;
      return Promise.resolve();
    };
  });

  await page.goto("/#/tour");
  await seedFinds(
    page,
    places.map((place) => place.id),
  );
  await page.reload();

  // Complete tour → closing note on the tour screen links to the recap.
  await expect(page.getByText(`${N} of ${N} found`)).toBeVisible();
  await page.getByRole("link", { name: /see your ride/i }).first().click();

  await expect(page.getByRole("heading", { name: /your ride/i })).toBeVisible();
  const tiles = page.locator(".recap__tile");
  await expect(tiles).toHaveCount(N);
  for (const [index, place] of places.entries()) {
    await expect(tiles.nth(index)).toContainText(place.name);
  }
  await expect(page.getByText(tour.closingNote.slice(0, 40))).toBeVisible();

  await page.getByRole("button", { name: /save your ride/i }).click();
  await expect
    .poll(async () =>
      page.evaluate(
        () => (window as Window & { __sharedFiles?: number }).__sharedFiles,
      ),
    )
    .toBe(1);
});

test("partial recap: reachable mid-drive and honest about what's left", async ({
  page,
}) => {
  await page.goto("/#/tour");
  await seedFinds(
    page,
    places.slice(0, 3).map((place) => place.id),
  );
  await page.reload();

  await expect(page.getByText(`3 of ${N} found`)).toBeVisible();
  await page.getByRole("link", { name: /your ride so far/i }).click();

  await expect(page.getByRole("heading", { name: /your ride/i })).toBeVisible();
  await expect(page.locator(".recap__tile")).toHaveCount(3);
  await expect(page.getByText(new RegExp(`3 of ${N}`, "i"))).toBeVisible();
});
