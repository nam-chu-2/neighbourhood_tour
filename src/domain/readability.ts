import type { Route } from "../router";
import { isFound, type TourState } from "./tourState";
import type { Place } from "./types";

/**
 * US3 / research R9: a place's description is readable when it was found on
 * this device, OR the whole tour is complete on this device, OR the URL
 * carries ?after=1 (a post-drive share link). Otherwise a deep link shows
 * the place locked with the route as the way in (FR-013).
 */
export function canRead(place: Place, state: TourState, route: Route): boolean {
  return (
    isFound(state, place.id) || Boolean(state.progress.completedAt) || route.after
  );
}
