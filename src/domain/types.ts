// Domain types per specs/002-radio-dial-tour/data-model.md.
//
// Two data domains: authored content (static, baked into the build) and
// visitor state (per device, localStorage). A third category — tuning state —
// is transient, and is deliberately split: its continuous part lives in CSS
// custom properties (--tune / --detune, never React state), its discrete part
// is the reducer below.

// ---------- Authored content ----------

/** The frequency range the dial spans. */
export interface Band {
  min: number;
  max: number;
}

export type VisualKind = "photo" | "illustration";

export interface Visual {
  /** Asset URL (Vite-resolved) for a file under src/content/media/. */
  src: string;
  /** Required, meaningful text alternative (FR-021). */
  alt: string;
  credit: string;
  kind: VisualKind;
}

export interface Station {
  /** URL-safe slug, stable — used in deep links (FR-018) and storage keys. */
  id: string;
  /** 1-based, unique, contiguous, in the order the places occur along the road. */
  order: number;
  /** Position on the band and the on-screen ident, e.g. 101.7. */
  frequency: number;
  name: string;
  /** Optional decorative ident; never the only carrier of meaning. */
  callSign?: string;
  /** Optional very short label printed on the band; falls back to the frequency. */
  dialLabel?: string;
  /** At least one; the first is the hero visual (FR-007). */
  visuals: Visual[];
  /** First-person story. */
  memory: string;
  /** Optional comparison for a downtown-only audience. */
  downtownTranslation?: string;
}

export interface Broadcast {
  id: "bells-corners";
  title: string;
  /** The single instruction shown before the first lock-in (FR-001). */
  intro: string;
  band: Band;
  stations: Station[];
  /** The closing broadcast, shown once every station is received (FR-012). */
  signOff: string;
}

/** One stop in the palette the band travels through (FR-011). */
export interface PaletteStop {
  /** Position along the band, 0–1. */
  at: number;
  name: string;
  bg: string;
  ink: string;
  accent: string;
}

// ---------- Visitor state (per device) ----------

export interface Reception {
  stationId: string;
  /** ISO datetime of the lock-in. */
  at: string;
}

export interface VisitorState {
  version: number;
  receptions: Reception[];
  /** The visitor's sound preference; sound is off until they ask for it (FR-014). */
  soundOn: boolean;
  startedAt?: string;
  completedAt?: string;
}

// ---------- Tuning (transient) ----------

export type TuningState =
  | { phase: "offStation" }
  | { phase: "settling"; candidateId: string }
  | { phase: "locked"; stationId: string };

export type TuningEvent =
  | {
      type: "SCROLL";
      nearestId: string | null;
      /** Distance from the nearest station's centre, in band units (0–1). */
      distance: number;
      lockRadius: number;
    }
  | { type: "SETTLED" }
  | { type: "FOCUS_STATION"; stationId: string }
  | { type: "OPEN_STATION"; stationId: string };
