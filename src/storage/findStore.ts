import { del, get, keys, set, clear } from "idb-keyval";
import type { Find, Progress, Tour } from "../domain/types";

// On-device persistence (FR-008, research R5): idb-keyval with keys
// `find:<placeId>` and `progress`. Photos are Blobs, which is why this is
// IndexedDB and not localStorage. Nothing ever leaves the device (FR-015).

const FIND_PREFIX = "find:";
const PROGRESS_KEY = "progress";

// Photos are persisted as ArrayBuffer + mime type rather than raw Blobs:
// Blob records in IndexedDB have a history of breakage on iOS Safari (and in
// fake-indexeddb under test); plain buffers structured-clone everywhere.
interface StoredFind {
  placeId: string;
  method: Find["method"];
  at: string;
  photoBytes: ArrayBuffer | null;
  photoType: string | null;
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  // Blob.arrayBuffer() is everywhere we target, but jsdom (tests) lacks it.
  if (typeof blob.arrayBuffer === "function") return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

async function toStored(find: Find): Promise<StoredFind> {
  return {
    placeId: find.placeId,
    method: find.method,
    at: find.at,
    photoBytes: find.photo ? await blobToArrayBuffer(find.photo) : null,
    photoType: find.photo?.type ?? null,
  };
}

function fromStored(stored: StoredFind): Find {
  return {
    placeId: stored.placeId,
    method: stored.method,
    at: stored.at,
    photo: stored.photoBytes
      ? new Blob([stored.photoBytes], { type: stored.photoType ?? "image/jpeg" })
      : null,
  };
}

export async function saveFind(find: Find): Promise<void> {
  await set(`${FIND_PREFIX}${find.placeId}`, await toStored(find));
}

export async function deleteFind(placeId: string): Promise<void> {
  await del(`${FIND_PREFIX}${placeId}`);
}

/** All Finds for places in the tour, ordered by route order. */
export async function loadFinds(tour: Tour): Promise<Find[]> {
  const allKeys = await keys();
  const findKeys = allKeys.filter(
    (key): key is string => typeof key === "string" && key.startsWith(FIND_PREFIX),
  );
  const loaded = await Promise.all(findKeys.map((key) => get<StoredFind>(key)));
  const orderByPlace = new Map(tour.places.map((place) => [place.id, place.order]));
  return loaded
    .filter((stored): stored is StoredFind => !!stored && orderByPlace.has(stored.placeId))
    .sort((a, b) => orderByPlace.get(a.placeId)! - orderByPlace.get(b.placeId)!)
    .map(fromStored);
}

export async function saveProgress(progress: Progress): Promise<void> {
  await set(PROGRESS_KEY, progress);
}

export async function loadProgress(): Promise<Progress | null> {
  return (await get<Progress>(PROGRESS_KEY)) ?? null;
}

export async function clearAll(): Promise<void> {
  await clear();
}
