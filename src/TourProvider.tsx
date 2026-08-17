import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { isCameraError, openCamera } from "./camera/capture";
import { downscaleToJpeg } from "./camera/downscale";
import {
  initialState,
  reducer,
  type TourAction,
  type TourState,
} from "./domain/tourState";
import type { Find, Tour } from "./domain/types";
import {
  deleteFind,
  loadFinds,
  loadProgress,
  saveFind,
  saveProgress,
} from "./storage/findStore";

// Orchestration layer (T029): owns the reducer state, hydrates from and
// persists to IndexedDB, runs the snap() camera flow, and keeps a small
// in-memory debug event ring for the ?debug=1 panel (Constitution V — no
// server, nothing sent anywhere, never persisted).

export interface DebugEvent {
  at: string;
  event: string;
}

interface TourContextValue {
  state: TourState;
  /** False until IndexedDB state has been loaded (prevents locked flash). */
  ready: boolean;
  /** Open the camera; optionally retake the photo of an existing find. */
  snap: (opts?: { retakeFor?: string }) => Promise<void>;
  /** Confirm the current proposal; returns the found place id. */
  confirm: () => string | null;
  pickDifferent: () => void;
  /** Pick a specific place from the unfound list; returns the place id. */
  pick: (placeId: string) => string;
  retake: () => void;
  dismiss: () => void;
  /** Mark the proposed (or a given) place found with no photo (FR-005). */
  markWithoutPhoto: (placeId?: string) => string | null;
  undo: (placeId: string) => void;
  /** The just-found reveal finished (or was skipped) — don't replay it. */
  ackReveal: () => void;
  debugLog: DebugEvent[];
}

const TourContext = createContext<TourContextValue | null>(null);

const DEBUG_RING_SIZE = 50;

export function TourProvider({ tour, children }: { tour: Tour; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, tour, initialState);
  const [debugLog, setDebugLog] = useState<DebugEvent[]>([]);

  const logEvent = useCallback((event: string) => {
    setDebugLog((log) =>
      [...log, { at: new Date().toISOString(), event }].slice(-DEBUG_RING_SIZE),
    );
  }, []);

  const send = useCallback(
    (action: TourAction) => {
      logEvent(action.type);
      dispatch(action);
    },
    [logEvent],
  );

  // ---- Hydrate once from IndexedDB (FR-008) ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [finds, progress] = await Promise.all([loadFinds(tour), loadProgress()]);
        if (!cancelled) {
          dispatch({ type: "hydrate", finds, progress: progress ?? {} });
          logEvent(`hydrated: ${finds.length} find(s)`);
        }
      } catch (error) {
        // A broken store must not brick the tour: start fresh in memory.
        if (!cancelled) {
          dispatch({ type: "hydrate", finds: [], progress: {} });
          logEvent(`hydrate failed: ${String(error)}`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tour, logEvent]);

  // ---- Persist on every Find / Progress change ----
  const knownFinds = useRef<Map<string, Find> | null>(null);
  useEffect(() => {
    if (!state.hydrated) return;
    const next = new Map(state.finds.map((find) => [find.placeId, find]));
    const previous = knownFinds.current;
    knownFinds.current = next;
    if (previous === null) return; // first pass after hydrate — already stored
    for (const [placeId, find] of next) {
      if (previous.get(placeId) !== find) {
        void saveFind(find).catch((error) => logEvent(`save failed: ${String(error)}`));
      }
    }
    for (const placeId of previous.keys()) {
      if (!next.has(placeId)) {
        void deleteFind(placeId).catch((error) =>
          logEvent(`delete failed: ${String(error)}`),
        );
      }
    }
  }, [state.hydrated, state.finds, logEvent]);

  const knownProgress = useRef<TourState["progress"] | null>(null);
  useEffect(() => {
    if (!state.hydrated) return;
    const previous = knownProgress.current;
    knownProgress.current = state.progress;
    if (previous === null || previous === state.progress) return;
    void saveProgress(state.progress).catch((error) =>
      logEvent(`progress save failed: ${String(error)}`),
    );
  }, [state.hydrated, state.progress, logEvent]);

  // ---- Snap orchestration: capture → downscale → propose ----
  const snap = useCallback(
    async (opts?: { retakeFor?: string }) => {
      if (opts?.retakeFor) {
        send({ type: "retakePhoto", placeId: opts.retakeFor });
      } else {
        send({ type: "snapStarted" });
      }
      const result = await openCamera();
      if (isCameraError(result)) {
        logEvent(`camera: ${result.kind}`);
        send({ type: "cameraUnavailable", error: result.kind });
        return;
      }
      let photo: Blob = result;
      try {
        photo = await downscaleToJpeg(result);
      } catch (error) {
        // Keep the original file rather than losing the moment.
        logEvent(`downscale failed, keeping original: ${String(error)}`);
      }
      send({ type: "photoCaptured", photo });
    },
    [send, logEvent],
  );

  const confirm = useCallback((): string | null => {
    const placeId = state.snap.phase === "proposing" ? state.snap.placeId : null;
    if (placeId) send({ type: "confirmProposal" });
    return placeId;
  }, [state.snap, send]);

  const pickDifferent = useCallback(() => send({ type: "pickDifferent" }), [send]);

  const pick = useCallback(
    (placeId: string): string => {
      send({ type: "pickPlace", placeId });
      return placeId;
    },
    [send],
  );

  const retake = useCallback(() => send({ type: "retake" }), [send]);
  const dismiss = useCallback(() => send({ type: "dismiss" }), [send]);

  const markWithoutPhoto = useCallback(
    (placeId?: string): string | null => {
      const target =
        placeId ??
        (state.snap.phase === "cameraUnavailable" ? state.snap.placeId : null);
      if (target) send({ type: "markWithoutPhoto", placeId: target });
      return target;
    },
    [state.snap, send],
  );

  const undo = useCallback(
    (placeId: string) => send({ type: "undoFind", placeId }),
    [send],
  );

  const ackReveal = useCallback(() => dispatch({ type: "revealShown" }), []);

  const value = useMemo<TourContextValue>(
    () => ({
      state,
      ready: state.hydrated,
      snap,
      confirm,
      pickDifferent,
      pick,
      retake,
      dismiss,
      markWithoutPhoto,
      undo,
      ackReveal,
      debugLog,
    }),
    [
      state,
      snap,
      confirm,
      pickDifferent,
      pick,
      retake,
      dismiss,
      markWithoutPhoto,
      undo,
      ackReveal,
      debugLog,
    ],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour must be used inside <TourProvider>");
  return value;
}
