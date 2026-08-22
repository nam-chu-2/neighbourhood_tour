// Domain types per specs/003-editorial-expedition-page/data-model.md.
//
// One data domain: authored content, static and baked into the build. There is
// no visitor state — 001 stored photographs, 002 stored received stations, and
// this feature stores nothing at all, on the device or anywhere else (FR-020).
//
// The only other structure is the image manifest, generated at build time so
// every image's box can be reserved before its bytes arrive.

export interface ExpeditionFact {
  label: string;
  value: string;
}

export interface Image {
  /** Path to the source photograph under src/content/media/. */
  src: string;
  /** Required, meaningful text alternative (FR-019). */
  alt: string;
  credit: string;
  /** Where to anchor the crop when the frame is tighter than the photograph. */
  focus?: "top" | "centre" | "bottom";
}

export interface Stop {
  /** URL-safe slug and anchor target; stable once shared (FR-014). */
  id: string;
  /** 1-based, unique, contiguous, matching the order on the page. */
  number: number;
  headline: string;
  /** Optional single line under the headline. */
  standfirst?: string;
  /** At least one; the first is the lead photograph (FR-005). */
  images: Image[];
  /** First-person paragraphs. */
  story: string[];
  /** Optional tie to something familiar downtown (FR-006). */
  downtownTranslation?: string;
}

export interface Expedition {
  id: "bells-corners";
  title: string;
  /** The single line under the title saying what this is (FR-001). */
  dek: string;
  heroImage: Image;
  /** Duration, distance, number of stops — at minimum (FR-002). */
  facts: ExpeditionFact[];
  /** Framing for a reader whose Ottawa stops at the Greenbelt (FR-003). */
  overview: string[];
  stops: Stop[];
  closing: string;
  credits: string;
}

// ---------- Generated image manifest ----------

export type ImageFormat = "avif" | "webp" | "jpeg";

export interface Variant {
  format: ImageFormat;
  width: number;
  url: string;
  bytes: number;
}

export interface ImageManifestEntry {
  /** The source path, exactly as written in Image.src — the manifest's key. */
  source: string;
  /** Intrinsic dimensions, rendered into every <img> so nothing shifts. */
  width: number;
  height: number;
  aspectRatio: number;
  variants: Variant[];
}
