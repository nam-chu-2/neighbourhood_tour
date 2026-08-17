import { expect, type Page } from "@playwright/test";
import path from "node:path";

// Shared Playwright helpers (T017). The snap flow drives a hidden
// <input type="file"> — no real camera exists in CI.

export const FIXTURES_DIR = path.resolve(import.meta.dirname, "../fixtures");

export function placeFixture(placeId: string): string {
  return path.join(FIXTURES_DIR, "places", `${placeId}-1.jpg`);
}

/** Tap the Snap button and feed `fixturePath` into the hidden camera input. */
export async function snap(page: Page, fixturePath: string): Promise<void> {
  const chooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /snap/i }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles(fixturePath);
  // The proposal sheet is the next stable state.
  await expect(page.getByRole("dialog")).toBeVisible();
}

/** Confirm the proposal ("Yes, that's it"). */
export async function confirmProposal(page: Page): Promise<void> {
  await page.getByRole("button", { name: /yes, that.s it/i }).click();
}

/** From the proposal, open the pick list and choose the place named `name`. */
export async function pickPlace(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { name: /pick a different place/i }).click();
  await page.getByRole("button", { name }).click();
}

/** FR-010 / SC-004: the page must never scroll horizontally. */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "horizontal overflow in px").toBeLessThanOrEqual(0);
}

/** Wipe IndexedDB (finds, progress) so a test starts from a fresh visitor. */
export async function resetStorage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const dbs = await indexedDB.databases();
    await Promise.all(
      dbs
        .filter((db) => db.name)
        .map(
          (db) =>
            new Promise<void>((resolve) => {
              const req = indexedDB.deleteDatabase(db.name!);
              req.onsuccess = req.onerror = req.onblocked = () => resolve();
            }),
        ),
    );
  });
}

/**
 * Seed Finds directly into IndexedDB (idb-keyval's default db/store:
 * "keyval-store"/"keyval") so US2/US3 tests can start mid-tour without
 * replaying the snap flow. Reload the page afterwards to hydrate.
 */
export async function seedFinds(page: Page, placeIds: string[]): Promise<void> {
  await page.evaluate(async (ids) => {
    const open = () =>
      new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open("keyval-store");
        req.onupgradeneeded = () => req.result.createObjectStore("keyval");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    const db = await open();

    // A tiny valid JPEG is enough — the app only displays it. Finds are
    // persisted as ArrayBuffer + type (see src/storage/findStore.ts).
    const canvas = document.createElement("canvas");
    canvas.width = 8;
    canvas.height = 6;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#1b6b3a";
    ctx.fillRect(0, 0, 8, 6);
    const photo: Blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.8),
    );
    const photoBytes = await photo.arrayBuffer();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("keyval", "readwrite");
      const store = tx.objectStore("keyval");
      for (const placeId of ids) {
        store.put(
          {
            placeId,
            photoBytes,
            photoType: "image/jpeg",
            method: "proposal",
            at: new Date().toISOString(),
          },
          `find:${placeId}`,
        );
      }
      store.put({ startedAt: new Date().toISOString() }, "progress");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }, placeIds);
}
