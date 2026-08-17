import { expect, test } from "@playwright/test";
import { tour } from "../../src/content/tour";
import {
  confirmProposal,
  expectNoHorizontalScroll,
  pickPlace,
  placeFixture,
  snap,
} from "./helpers";

// US1 core flow on phone viewports (T022). Desktop layout is covered in
// us1-fallbacks-offline.spec.ts.
test.skip(({ isMobile }) => !isMobile, "phone-only spec");

const places = [...tour.places].sort((a, b) => a.order - b.order);
const N = places.length;
const [p1, p2, p3, p4, p5, p6] = places as [
  (typeof places)[0],
  (typeof places)[0],
  (typeof places)[0],
  (typeof places)[0],
  (typeof places)[0],
  (typeof places)[0],
];

test("welcome renders portrait-clean with a single primary action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: tour.title })).toBeVisible();
  await expect(page.getByRole("link", { name: /start the ride/i })).toBeVisible();
  await expectNoHorizontalScroll(page);
});

test("the full ride: snap, confirm, pick, retake, out of order, persist, closing note", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: /start the ride/i }).click();

  // Ordered list, all not yet found, visible progress (FR-002).
  await expect(page.getByText(`0 of ${N} found`)).toBeVisible();
  await expectNoHorizontalScroll(page);

  // Snap → proposal shows the photo and the next place in route order (FR-003).
  await snap(page, placeFixture(p1.id));
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: `Is this ${p1.name}?` }),
  ).toBeVisible();
  await expect(dialog.getByRole("img", { name: /your photo/i })).toBeVisible();

  // One tap confirms and the description opens within a second (SC-002).
  const confirmedAt = Date.now();
  await confirmProposal(page);
  await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
  expect(Date.now() - confirmedAt).toBeLessThan(1000);

  // Description: name, hero visual with alt, story, downtown translation (FR-004).
  await expect(page.getByRole("img", { name: p1.media[0]!.alt })).toBeVisible();
  await expect(page.getByText(p1.story.slice(0, 40))).toBeVisible();
  await expect(page.getByText(/downtown translation/i)).toBeVisible();

  await page.getByRole("link", { name: /back to the route/i }).click();
  await expect(page.getByText(`1 of ${N} found`)).toBeVisible();

  // Wrong proposal → "Pick a different place" (scenario 2a).
  await snap(page, placeFixture(p4.id));
  await expect(
    page.getByRole("heading", { name: `Is this ${p2.name}?` }),
  ).toBeVisible();
  await pickPlace(page, p4.name);
  await expect(page.getByRole("heading", { name: p4.name })).toBeVisible();
  await page.getByRole("link", { name: /back to the route/i }).click();
  await expect(page.getByText(`2 of ${N} found`)).toBeVisible();

  // Order-aware proposal: {1,4} found → proposes 5, never a found place (2c).
  await snap(page, placeFixture(p5.id));
  await expect(
    page.getByRole("heading", { name: `Is this ${p5.name}?` }),
  ).toBeVisible();

  // Retake discards: nothing found (2b).
  await page.getByRole("button", { name: /retake/i }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByText(`2 of ${N} found`)).toBeVisible();

  // Out-of-order finding is allowed (FR-006): photograph place 3 now.
  await snap(page, placeFixture(p3.id));
  await pickPlace(page, p3.name);
  await expect(page.getByRole("heading", { name: p3.name })).toBeVisible();
  await page.getByRole("link", { name: /back to the route/i }).click();
  await expect(page.getByText(`3 of ${N} found`)).toBeVisible();

  // Reload persists finds and photos (FR-008).
  await page.reload();
  await expect(page.getByText(`3 of ${N} found`)).toBeVisible();
  await page.getByRole("link", { name: p1.name }).click();
  await expect(page.getByRole("heading", { name: p1.name })).toBeVisible();
  await expect(page.getByRole("img", { name: /your shot/i })).toBeVisible();
  await page.getByRole("link", { name: /back to the route/i }).click();

  // Finish the drive: {1,3,4} found → proposals go 5, 6, then wrap to 2.
  for (const remaining of [p5, p6, p2]) {
    await snap(page, placeFixture(remaining.id));
    await expect(
      page.getByRole("heading", { name: `Is this ${remaining.name}?` }),
    ).toBeVisible();
    await confirmProposal(page);
    await expect(page.getByRole("heading", { name: remaining.name })).toBeVisible();
    if (remaining !== p2) {
      await page.getByRole("link", { name: /back to the route/i }).click();
    }
  }

  // Final place found → the closing note completes the tour (scenario 5).
  await expect(page.getByText(tour.closingNote.slice(0, 40))).toBeVisible();
});
