// Whether a section should animate as it scrolls into view — and, far more
// importantly, when it must not.
//
// The page is nothing but content, so the worst failure it has is a blank
// screen. That is exactly what the usual "hide in CSS, reveal with JS" pattern
// produces when scripting fails. Here the finished state is the default and
// the hidden state is applied only when JavaScript is definitely running,
// motion is welcome, and the observer exists (research R1, FR-012, FR-021).

export type RevealState = "hidden" | "revealed";

export type RevealEvent = { type: "ENTERED" } | { type: "LEFT" };

export interface RevealConditions {
  /** True only once client-side code has actually run. */
  scripting: boolean;
  reducedMotion: boolean;
  observerSupported: boolean;
}

export function shouldAnimate({
  scripting,
  reducedMotion,
  observerSupported,
}: RevealConditions): boolean {
  return scripting && observerSupported && !reducedMotion;
}

/** Hidden only when we are going to animate; finished in every other case. */
export function initialRevealState(animating: boolean): RevealState {
  return animating ? "hidden" : "revealed";
}

/** One-shot: once revealed, a section never goes back. */
export function revealReducer(state: RevealState, event: RevealEvent): RevealState {
  if (state === "revealed") return "revealed";
  return event.type === "ENTERED" ? "revealed" : "hidden";
}
