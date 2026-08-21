import { useRadio } from "../RadioProvider";

// One obvious control, on and off at any point (FR-014). Sound is off until
// the visitor asks for it — they may well open this link in an office — and
// nothing in the tour is carried by audio alone.

export function SoundToggle() {
  const { soundOn, toggleSound, soundUnavailable } = useRadio();

  if (soundUnavailable) {
    return (
      <p className="radio__sound-note" data-testid="sound-toggle" aria-pressed="false">
        This device will not play sound — the tour reads the same without it.
      </p>
    );
  }

  return (
    <button
      type="button"
      className="radio__sound"
      data-testid="sound-toggle"
      aria-pressed={soundOn}
      onClick={toggleSound}
    >
      <span aria-hidden="true">{soundOn ? "🔊" : "🔇"}</span>
      <span className="radio__sound-label">Sound {soundOn ? "on" : "off"}</span>
    </button>
  );
}
