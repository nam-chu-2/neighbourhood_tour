import type { Find, Place, Tour } from "./types";

/**
 * The order-aware proposal rule (FR-003a, data-model.md): the first
 * not-yet-found place whose route order is greater than the highest found
 * order, else the first not-yet-found place overall; null when the tour is
 * complete. A found place is never proposed.
 */
export function nextProposedPlace(tour: Tour, finds: Find[]): Place | null {
  const foundIds = new Set(finds.map((find) => find.placeId));
  const unfound = tour.places
    .filter((place) => !foundIds.has(place.id))
    .sort((a, b) => a.order - b.order);
  if (unfound.length === 0) return null;

  const maxFoundOrder = Math.max(
    0,
    ...tour.places.filter((place) => foundIds.has(place.id)).map((place) => place.order),
  );
  return unfound.find((place) => place.order > maxFoundOrder) ?? unfound[0]!;
}
