// Optional sound, synthesised rather than shipped (research R6): a filtered
// noise buffer for the hiss, a short tone when a station lands, a click for
// the dial. No audio files means nothing extra in the bundle, nothing extra to
// precache for offline, and a hiss that can follow the tuning continuously
// instead of looping a recording.
//
// Nothing here is ever required: every station is complete in silence
// (FR-014), and the AudioContext is created only when the visitor asks for
// sound — never at load (contract §7).

interface Rig {
  context: AudioContext;
  hissGain: GainNode;
  master: GainNode;
  timer: ReturnType<typeof setInterval>;
}

let rig: Rig | null = null;

/** How often the hiss re-reads --detune. Not per frame: 60 ms is inaudible. */
const FOLLOW_MS = 60;
const HISS_CEILING = 0.09;

export function isSoundSupported(): boolean {
  return typeof window !== "undefined" && typeof window.AudioContext === "function";
}

function makeNoiseBuffer(context: AudioContext): AudioBuffer {
  const seconds = 2;
  const buffer = context.createBuffer(1, context.sampleRate * seconds, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) channel[i] = Math.random() * 2 - 1;
  return buffer;
}

function currentDetune(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--detune");
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
}

/**
 * Start the radio's sound. Returns false when the device cannot or will not
 * play audio — the caller says so plainly once and carries on (FR-023).
 */
export async function startSound(): Promise<boolean> {
  if (rig) return true;
  if (!isSoundSupported()) return false;

  try {
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = 1;
    master.connect(context.destination);

    // Hiss: white noise through a band-pass, so it sits behind everything
    // rather than on top of it.
    const source = context.createBufferSource();
    source.buffer = makeNoiseBuffer(context);
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800;
    filter.Q.value = 0.6;

    const hissGain = context.createGain();
    hissGain.gain.value = 0;

    source.connect(filter).connect(hissGain).connect(master);
    source.start();

    // The hiss follows the needle: loud in the static, gone on a station.
    const timer = setInterval(() => {
      if (!rig) return;
      const target = currentDetune() * HISS_CEILING;
      rig.hissGain.gain.linearRampToValueAtTime(
        target,
        rig.context.currentTime + FOLLOW_MS / 1000,
      );
    }, FOLLOW_MS);

    rig = { context, hissGain, master, timer };
    await context.resume().catch(() => undefined);
    return true;
  } catch {
    rig = null;
    return false;
  }
}

export function stopSound(): void {
  if (!rig) return;
  clearInterval(rig.timer);
  void rig.context.close().catch(() => undefined);
  rig = null;
}

function blip(frequency: number, duration: number, peak: number): void {
  if (!rig) return;
  const { context, master } = rig;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  const now = context.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain).connect(master);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

/** The station ident: two notes, the sound of something locking in. */
export function playIdent(): void {
  if (!rig) return;
  blip(660, 0.16, 0.12);
  setTimeout(() => blip(880, 0.22, 0.1), 110);
}

/** A dial click. */
export function playClick(): void {
  blip(220, 0.05, 0.05);
}
