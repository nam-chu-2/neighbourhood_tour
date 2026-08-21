import { expect, test } from "@playwright/test";
import { openRoute, resetStorage, seedReceptions, tuneToStation } from "./helpers";

// The paths where something is missing — no network, no storage, no audio.
// None of them may end the tour (FR-019, FR-023, SC-008).

const ALL = [
  "bells-corners-sign",
  "old-richmond-road",
  "the-school",
  "the-plaza",
  "greenbelt-woods",
  "childhood-street",
];

test.describe("offline", () => {
  test("the whole tour keeps working with the network cut", async ({ page, context }) => {
    await page.goto("/");
    await resetStorage(page);
    await page.reload();
    await expect(page.getByTestId("band")).toBeVisible();
    // Let the service worker take control before pulling the plug.
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    });

    await context.setOffline(true);

    await tuneToStation(page, "the-plaza");
    await expect(page.getByTestId("broadcast")).toContainText("The Plaza");

    await tuneToStation(page, "greenbelt-woods");
    await expect(page.getByTestId("broadcast")).toContainText("Greenbelt");

    await page.getByTestId("guide").click();
    await expect(page.getByRole("listitem")).toHaveCount(6);

    await page.goto("/#/");
    await expect(page.getByTestId("band")).toBeVisible();

    await context.setOffline(false);
  });

  test("a reload while offline still serves the radio, not an error page", async ({
    page,
    context,
  }) => {
    await page.goto("/");
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    });
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId("band")).toBeVisible();
    await expect(page.getByTestId("offstation")).toBeVisible();
    await context.setOffline(false);
  });

  test("the sign-off and keepsake work offline", async ({ page, context }) => {
    await page.goto("/");
    await resetStorage(page);
    await seedReceptions(page, ALL);
    await openRoute(page, "#/signoff");
    await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
      timeout: 15_000,
    });
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByTestId("keepsake")).toBeVisible();
    await page.getByTestId("keepsake-save").click();
    // Composing the card is local work; it must not need the network.
    await expect(page.getByTestId("keepsake")).toBeVisible();
    await context.setOffline(false);
  });
});

test.describe("storage refuses", () => {
  test("the tour runs from memory and shows no error screen", async ({ page }) => {
    await page.addInitScript(() => {
      // Private-browsing behaviour: storage exists but throws on use.
      const boom = () => {
        throw new DOMException("denied", "SecurityError");
      };
      Object.defineProperty(window, "localStorage", {
        configurable: true,
        value: { getItem: boom, setItem: boom, removeItem: boom, clear: boom, key: boom, length: 0 },
      });
    });

    await page.goto("/");
    await expect(page.getByTestId("band")).toBeVisible();
    await tuneToStation(page, "the-school");
    await expect(page.getByTestId("broadcast")).toContainText("Elementary School");
    await expect(page.getByTestId("progress")).toContainText(/1 of 6/);

    // Only persistence is lost: a reload starts over, without complaint.
    await page.reload();
    await expect(page.getByTestId("progress")).toContainText(/0 of 6/);
    await expect(page.getByText(/error/i)).toHaveCount(0);
  });
});

test.describe("audio refuses", () => {
  test("says so once and leaves the tour alone", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "AudioContext", { configurable: true, value: undefined });
    });

    await page.goto("/");
    await expect(page.getByTestId("band")).toBeVisible();
    await page.getByTestId("sound-toggle").click();
    await expect(page.getByText(/will not play sound/i)).toBeVisible();

    // And the tour carries on regardless.
    await tuneToStation(page, "the-plaza");
    await expect(page.getByTestId("broadcast")).toContainText("The Plaza");
  });
});
