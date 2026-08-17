import { nextProposedPlace } from "./proposal";
import type {
  CameraErrorKind,
  Find,
  Place,
  Progress,
  SnapPhase,
  Tour,
} from "./types";

// Pure reducer + selectors for the whole tour experience (data-model.md
// "State transitions"). Side effects (camera, IndexedDB) live in
// TourProvider; everything here is unit-testable with plain objects.

export interface TourState {
  tour: Tour;
  finds: Find[];
  progress: Progress;
  snap: SnapPhase;
  /** The most recently found place — drives the route animation (US2). */
  lastFoundId: string | null;
  /** True once persisted state has been loaded (prevents locked-content flash). */
  hydrated: boolean;
}

export type TourAction =
  | { type: "hydrate"; finds: Find[]; progress: Progress }
  | { type: "snapStarted"; at?: string }
  | { type: "retakePhoto"; placeId: string }
  | { type: "photoCaptured"; photo: Blob; at?: string }
  | { type: "confirmProposal"; at?: string }
  | { type: "pickDifferent" }
  | { type: "pickPlace"; placeId: string; at?: string }
  | { type: "retake" }
  | { type: "dismiss" }
  | { type: "cameraUnavailable"; error: CameraErrorKind }
  | { type: "markWithoutPhoto"; placeId?: string; at?: string }
  | { type: "undoFind"; placeId: string };

export function initialState(tour: Tour): TourState {
  return {
    tour,
    finds: [],
    progress: {},
    snap: { phase: "idle" },
    lastFoundId: null,
    hydrated: false,
  };
}

function withFind(
  state: TourState,
  placeId: string,
  photo: Blob | null,
  method: Find["method"],
  at: string,
): TourState {
  // Invariant: exactly one Find per place.
  if (state.finds.some((find) => find.placeId === placeId)) return abandon(state);
  const finds = [...state.finds, { placeId, photo, method, at }];
  const complete = finds.length === state.tour.places.length;
  return {
    ...state,
    finds,
    snap: { phase: "idle" },
    lastFoundId: placeId,
    progress: {
      startedAt: state.progress.startedAt ?? at,
      ...(complete ? { completedAt: at } : {}),
    },
  };
}

function abandon(state: TourState): TourState {
  return { ...state, snap: { phase: "idle" } };
}

export function reducer(state: TourState, action: TourAction): TourState {
  const now = () => new Date().toISOString();

  switch (action.type) {
    case "hydrate":
      return { ...state, finds: action.finds, progress: action.progress, hydrated: true };

    case "snapStarted": {
      const at = action.at ?? now();
      return {
        ...state,
        snap: { phase: "capturing" },
        progress: { ...state.progress, startedAt: state.progress.startedAt ?? at },
      };
    }

    case "retakePhoto":
      return { ...state, snap: { phase: "capturing", retakeFor: action.placeId } };

    case "photoCaptured": {
      if (state.snap.phase !== "capturing") return state;
      if (state.snap.retakeFor) {
        // Replace the photo of an existing Find; method and time are kept.
        const retakeFor = state.snap.retakeFor;
        return {
          ...state,
          snap: { phase: "idle" },
          finds: state.finds.map((find) =>
            find.placeId === retakeFor ? { ...find, photo: action.photo } : find,
          ),
        };
      }
      const proposed = nextProposedPlace(state.tour, state.finds);
      if (!proposed) return abandon(state); // all found — nothing to propose
      return {
        ...state,
        snap: { phase: "proposing", placeId: proposed.id, photo: action.photo },
      };
    }

    case "confirmProposal": {
      if (state.snap.phase !== "proposing") return state;
      return withFind(
        state,
        state.snap.placeId,
        state.snap.photo,
        "proposal",
        action.at ?? now(),
      );
    }

    case "pickDifferent":
      if (state.snap.phase === "proposing") {
        return { ...state, snap: { phase: "picking", photo: state.snap.photo } };
      }
      if (state.snap.phase === "cameraUnavailable") {
        return { ...state, snap: { phase: "picking", photo: null } };
      }
      return state;

    case "pickPlace": {
      if (state.snap.phase !== "picking") return state;
      const photo = state.snap.photo;
      return withFind(
        state,
        action.placeId,
        photo,
        photo ? "picked" : "no-photo",
        action.at ?? now(),
      );
    }

    case "retake":
    case "dismiss":
      return abandon(state);

    case "cameraUnavailable": {
      if (state.snap.phase === "capturing" && state.snap.retakeFor) {
        // A failed retake keeps the existing Find; no sheet needed.
        return abandon(state);
      }
      const proposed = nextProposedPlace(state.tour, state.finds);
      return {
        ...state,
        snap: {
          phase: "cameraUnavailable",
          placeId: proposed?.id ?? null,
          error: action.error,
        },
      };
    }

    case "markWithoutPhoto": {
      const targetId =
        action.placeId ??
        (state.snap.phase === "cameraUnavailable" ? state.snap.placeId : null);
      if (!targetId) return abandon(state);
      return withFind(state, targetId, null, "no-photo", action.at ?? now());
    }

    case "undoFind": {
      const finds = state.finds.filter((find) => find.placeId !== action.placeId);
      const { completedAt: _cleared, ...progress } = state.progress;
      return {
        ...state,
        finds,
        progress,
        lastFoundId: state.lastFoundId === action.placeId ? null : state.lastFoundId,
      };
    }
  }
}

// ---------- Selectors ----------

export function foundCount(state: TourState): number {
  return state.finds.length;
}

export function isFound(state: TourState, placeId: string): boolean {
  return state.finds.some((find) => find.placeId === placeId);
}

export function findFor(state: TourState, placeId: string): Find | undefined {
  return state.finds.find((find) => find.placeId === placeId);
}

export function unfoundPlaces(state: TourState): Place[] {
  return state.tour.places
    .filter((place) => !isFound(state, place.id))
    .sort((a, b) => a.order - b.order);
}

export function isComplete(state: TourState): boolean {
  return state.finds.length === state.tour.places.length;
}
