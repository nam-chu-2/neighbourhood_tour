import { expect, type Page } from "@playwright/test";

// Shared Playwright helpers. The page is a document, so the tests read it the
// way a person does — scrolling and looking — rather than calling into it.

export const STOP_IDS = [
  "st-paul-high-school",
  "st-john-the-apostle",
  "stinson-avenue",
  "our-lady-of-peace",
  "mcdonalds",
  "canadian-tire",
  "britannia-beach",
];

/** Scroll a section into view and let any reveal settle. */
export async function scrollTo(page: Page, testId: string, nth = 0): Promise<void> {
  await page.getByTestId(testId).nth(nth).scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
}

export async function scrollToStop(page: Page, stopId: string): Promise<void> {
  await page.locator(`[data-stop-id="${stopId}"]`).scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
}

/** The order sections appear in the document. */
export async function sectionOrder(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    [...document.querySelectorAll("[data-testid]")]
      .map((element) => element.getAttribute("data-testid") ?? "")
      .filter((id) => ["hero", "facts", "overview", "route", "stop", "closing"].includes(id)),
  );
}

/** FR-010: the page must never scroll sideways. */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);
}

/** Block every image so the text-only reading can be checked (FR-021). */
export async function blockImages(page: Page): Promise<void> {
  await page.route("**/*.{png,jpg,jpeg,webp,avif,svg}", (route) => route.abort());
}
