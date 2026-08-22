import { expect, test } from "@playwright/test";

// The dev server and the production build must serve the same document.
//
// They did not: removing the client-side React render left `npm run dev`
// serving an empty <div id="root"> — a black screen — while the built site was
// fine, because only the build prerenders. The test suite ran against the build
// and never noticed. This is the regression test for that gap.

test("the page arrives as HTML, not as an empty root waiting for JavaScript", async ({
  page,
}) => {
  const response = await page.goto("/");
  const html = (await response?.text()) ?? "";

  expect(html, "the document must contain the title").toContain("Bells Corners");
  expect(html, "the document must contain the stops").toContain("data-stop-id");
  expect(html, "the root must not be empty").not.toContain('<div id="root"></div>');

  // Seven stops, in the document itself, before a single script runs.
  const stopsInHtml = (html.match(/data-testid="stop"/g) ?? []).length;
  expect(stopsInHtml).toBe(7);
});
