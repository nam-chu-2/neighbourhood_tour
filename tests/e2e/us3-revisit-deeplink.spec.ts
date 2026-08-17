import { expect, test } from "@playwright/test";
import { tour } from "../../src/content/tour";
import { seedFinds } from "./helpers";

// US3: the tour outlives the car — reopening keeps everything (FR-008), and
// each place is directly linkable in route context (FR-013).

const places = [...tour.places].sort((a, b) => a.order - b.order);
const p2 = places[1]!;
const N = places.length;

test("after completion, reopening in the same browser shows finds and recap", async ({
  page,
  context,
}) => {
  await page.goto("/#/tour");
  await seedFinds(
    page,
    places.map((place) => place.id),
  );
  await page.reload();
  await expect(page.getByText(`${N} of ${N} found`)).toBeVisible();

  // A brand-new page (fresh JS world, same device profile) sees it all too.
  const reopened = await context.newPage();
  await reopened.goto(page.url());
  await expect(reopened.getByText(`${N} of ${N} found`)).toBeVisible();
  await reopened.getByRole("link", { name: /see your ride/i }).first().click();
  await expect(reopened.locator(".recap__tile")).toHaveCount(N);
  await reopened.close();
});

test("a deep link on a fresh device is locked, with the route as the way in", async ({
  page,
}) => {
  await page.goto(`/#/place/${p2.id}`);
  await expect(page.getByRole("heading", { name: p2.name })).toBeVisible();
  await expect(page.getByText(/not yet found/i)).toBeVisible();
  // The story must NOT leak before it is unlocked.
  await expect(page.getByText(p2.story.slice(0, 40))).toBeHidden();
  await page.getByRole("link", { name: /route/i }).click();
  await expect(page.getByText(`0 of ${N} found`)).toBeVisible();
});

test("an ?after=1 share link opens the full description on any device", async ({
  page,
}) => {
  await page.goto(`/#/place/${p2.id}?after=1`);
  await expect(page.getByRole("heading", { name: p2.name })).toBeVisible();
  await expect(page.getByText(p2.story.slice(0, 40))).toBeVisible();
  // Route context is visible around the description.
  await expect(page.getByRole("link", { name: /back to the route/i })).toBeVisible();
});

test("Share this place produces the ?after=1 link once the tour is complete", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const nav = navigator as Navigator & {
      share?: (data?: { url?: string }) => Promise<void>;
    };
    nav.share = (data) => {
      (window as Window & { __sharedUrl?: string }).__sharedUrl = data?.url ?? "";
      return Promise.resolve();
    };
  });

  await page.goto("/#/tour");
  await seedFinds(
    page,
    places.map((place) => place.id),
  );
  await page.reload();
  await page.getByRole("link", { name: p2.name }).click();
  await expect(page.getByRole("heading", { name: p2.name })).toBeVisible();

  await page.getByRole("button", { name: /share this place/i }).click();
  await expect
    .poll(async () =>
      page.evaluate(() => (window as Window & { __sharedUrl?: string }).__sharedUrl),
    )
    .toContain(`#/place/${p2.id}?after=1`);
});
