// Domain types per specs/001-bells-corners-tour/data-model.md.
// Two data domains: authored content (static, baked into the build) and
// visitor state (per device, IndexedDB). Nothing is stored anywhere else.

// ---------- Authored content ----------

export type MediaKind = "photo" | "illustration" | "map";

export interface Media {
  /** Asset URL (Vite-resolved) for a file under src/content/media/. */
  src: string;
  /** Required, meaningful text alternative (FR-014). */
  alt: string;
  credit: string;
  kind: MediaKind;
}

export interface Place {
  /** URL-safe slug, stable — used in deep links and storage keys. */
  id: string;
  /** Route order, 1-based, unique — drives the proposal (FR-003a). */
  order: number;
  name: string;
  /** Marker position in route viewBox units. */
  routePosition: { x: number; y: number };
  /** At least one; the first is the hero visual (FR-004). */
  media: Media[];
  /** First-person story. */
  story: string;
  /** Optional comparison for a downtown-only audience. */
  downtownTranslation?: string;
  /** Optional one-line "what to look for" shown with the proposal. */
  cue?: string;
}

export interface Tour {
  id: "bells-corners";
  title: string;
  intro: string;
  places: Place[];
  route: { viewBox: string; path: string };
  closingNote: string;
}

// ---------- Visitor state (per device) ----------

export type FindMethod = "proposal" | "picked" | "no-photo";

export interface Find {
  placeId: string;
  /** Downscaled JPEG (≤1024 px long edge); null for no-photo finds (FR-005). */
  photo: Blob | null;
  method: FindMethod;
  /** ISO datetime of the find. */
  at: string;
}

export interface Progress {
  /** ISO datetime of the first snap or Start tap. */
  startedAt?: string;
  /** ISO datetime set when every place is found. */
  completedAt?: string;
}

// ---------- Snap flow (in-memory only) ----------

export type CameraErrorKind = "denied" | "unavailable" | "failed" | "cancelled";

/**
 * The snap bottom-sheet state machine (data-model.md "State transitions").
 * `idle` — no sheet. `capturing` — the native camera/file input is open
 * (retakeFor set when re-taking a found place's photo from its detail page).
 * `proposing` — photo taken, proposing the next unfound place in route order.
 * `picking` — visitor chose "pick a different place". `cameraUnavailable` —
 * capture failed; offer a no-photo find so the tour continues (FR-005).
 */
export type SnapPhase =
  | { phase: "idle" }
  | { phase: "capturing"; retakeFor?: string }
  | { phase: "proposing"; placeId: string; photo: Blob }
  | { phase: "picking"; photo: Blob | null }
  | { phase: "cameraUnavailable"; placeId: string | null; error: CameraErrorKind };
