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
import { broadcast as authoredBroadcast } from "./content/broadcast";
import { lockRadiusFor } from "./domain/band";
import {
  addReception,
  initialTuningState,
  isComplete,
  isReceived,
  receivedCount as countReceived,
  tuningReducer,
} from "./domain/tuning";
import type { Broadcast, Reception, TuningEvent, TuningState, VisitorState } from "./domain/types";
import { isSoundSupported, playIdent, startSound, stopSound } from "./sound/radioSound";
import { loadVisitorState, saveVisitorState } from "./storage/receptionStore";
import { useAnnounce } from "./ui/a11y/LiveRegion";

// The radio's discrete state: which station is locked in, which have been
// received, and whether the visitor has asked for sound. The continuous part
// of tuning — where the needle is — never gets here; it lives in --tune and
// --detune so that dragging the dial costs no React work (research R4).

export interface DebugEntry {
  at: string;
  event: string;
}

interface RadioContextValue {
  broadcast: Broadcast;
  tuning: TuningState;
  receptions: Reception[];
  lockRadius: number;
  soundOn: boolean;
  /** True once every station has been received (FR-012). */
  complete: boolean;
  receivedCount: number;
  isStationReceived: (stationId: string) => boolean;
  /** Feed the tuning reducer — used by the dial, the guide and deep links. */
  tune: (event: TuningEvent) => void;
  openStation: (stationId: string) => void;
  toggleSound: () => void;
  /** False when the device refused to persist; the tour still runs (FR-023). */
  persistenceAvailable: boolean;
  /** Set when the device cannot play audio; said once, then out of the way. */
  soundUnavailable: boolean;
  debugLog: DebugEntry[];
  log: (event: string) => void;
}

const RadioContext = createContext<RadioContextValue | null>(null);

const DEBUG_RING = 50;

export function RadioProvider({
  children,
  broadcast = authoredBroadcast,
}: {
  children: ReactNode;
  broadcast?: Broadcast;
}) {
  const announce = useAnnounce();
  const stationIds = useMemo(
    () => broadcast.stations.map((station) => station.id),
    [broadcast],
  );
  const lockRadius = useMemo(
    () => lockRadiusFor(broadcast.stations, broadcast.band),
    [broadcast],
  );

  const [tuning, dispatchTuning] = useReducer(tuningReducer, initialTuningState);
  // Hydrated synchronously, not in an effect: anything that depends on saved
  // progress — above all whether the tour is complete — must be right on the
  // first render, or a bookmarked sign-off bounces the visitor to the dial
  // before their progress has loaded.
  const [visitor, setVisitor] = useState<VisitorState>(() =>
    loadVisitorState(broadcast.stations.map((station) => station.id)),
  );
  const [persistenceAvailable, setPersistenceAvailable] = useState(true);
  const [soundUnavailable, setSoundUnavailable] = useState(false);
  const [debugLog, setDebugLog] = useState<DebugEntry[]>([]);
  const persisted = useRef(false);

  const log = useCallback((event: string) => {
    // In-memory only: never persisted, never sent anywhere (Constitution V).
    setDebugLog((entries) =>
      [...entries, { at: new Date().toISOString(), event }].slice(-DEBUG_RING),
    );
  }, []);

  // Persist on change — never during scrolling, because scrolling never
  // changes this state.
  useEffect(() => {
    // Nothing to write on the first render — that state came from storage.
    if (!persisted.current) {
      persisted.current = true;
      log(`hydrated ${visitor.receptions.length} reception(s)`);
      return;
    }
    const saved = saveVisitorState(visitor);
    if (!saved) {
      setPersistenceAvailable(false);
      log("storage unavailable — progress will not be kept");
    }
  }, [visitor, log]);

  // Lock-in is what receives a station: a settle, a focus, or an explicit
  // open. Flying past one never gets here (FR-006, FR-009).
  useEffect(() => {
    if (tuning.phase !== "locked") return;
    const { stationId } = tuning;
    const station = broadcast.stations.find((candidate) => candidate.id === stationId);
    if (!station) return;

    setVisitor((current) => {
      if (isReceived(current.receptions, stationId)) return current;
      const at = new Date().toISOString();
      const receptions = addReception(current.receptions, stationId, at);
      const next: VisitorState = {
        ...current,
        receptions,
        startedAt: current.startedAt ?? at,
      };
      log(`received: ${stationId} (${receptions.length}/${stationIds.length})`);
      if (isComplete(receptions, stationIds) && !current.completedAt) {
        next.completedAt = at;
        log("tour complete — sign-off unlocked");
      }
      return next;
    });
  }, [tuning, broadcast, stationIds, log]);

  // Announce lock-ins politely, so progress is available without sight of the
  // dial (FR-021).
  const announced = useRef<string | null>(null);
  useEffect(() => {
    if (tuning.phase !== "locked") {
      announced.current = null;
      return;
    }
    if (announced.current === tuning.stationId) return;
    announced.current = tuning.stationId;
    const station = broadcast.stations.find((s) => s.id === tuning.stationId);
    if (!station) return;
    const received = countReceived(visitor.receptions);
    announce(`${station.name} tuned in. ${received} of ${broadcast.stations.length} received.`);
    log(`locked in: ${station.id}`);
    // `visitor.receptions` is read for the count only; announcing again on
    // every reception change would repeat the same message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tuning, broadcast, announce, log]);

  // Sound follows the visitor's preference and nothing else: no AudioContext
  // exists until they ask for one (contract §7).
  useEffect(() => {
    if (!visitor.soundOn) {
      stopSound();
      return;
    }
    let cancelled = false;
    void startSound().then((started) => {
      if (cancelled || started) return;
      setSoundUnavailable(true);
      log("audio unavailable on this device");
      setVisitor((current) => ({ ...current, soundOn: false }));
    });
    return () => {
      cancelled = true;
    };
  }, [visitor.soundOn, log]);

  // The ident plays on lock-in — decoration on top of a screen that already
  // says everything (silent parity, FR-014).
  useEffect(() => {
    if (tuning.phase !== "locked" || !visitor.soundOn) return;
    playIdent();
  }, [tuning, visitor.soundOn]);

  const tune = useCallback((event: TuningEvent) => dispatchTuning(event), []);

  const openStation = useCallback(
    (stationId: string) => dispatchTuning({ type: "OPEN_STATION", stationId }),
    [],
  );

  const toggleSound = useCallback(() => {
    if (!isSoundSupported()) {
      setSoundUnavailable(true);
      return;
    }
    setVisitor((current) => ({ ...current, soundOn: !current.soundOn }));
  }, []);

  const value = useMemo<RadioContextValue>(() => {
    const receivedCount = countReceived(visitor.receptions);
    return {
      broadcast,
      tuning,
      receptions: visitor.receptions,
      lockRadius,
      soundOn: visitor.soundOn,
      complete: isComplete(visitor.receptions, stationIds),
      receivedCount,
      isStationReceived: (stationId: string) => isReceived(visitor.receptions, stationId),
      tune,
      openStation,
      toggleSound,
      persistenceAvailable,
      soundUnavailable,
      debugLog,
      log,
    };
  }, [
    broadcast,
    tuning,
    visitor,
    lockRadius,
    stationIds,
    tune,
    openStation,
    toggleSound,
    persistenceAvailable,
    soundUnavailable,
    debugLog,
    log,
  ]);

  return <RadioContext.Provider value={value}>{children}</RadioContext.Provider>;
}

export function useRadio(): RadioContextValue {
  const value = useContext(RadioContext);
  if (!value) throw new Error("useRadio must be used inside <RadioProvider>");
  return value;
}
