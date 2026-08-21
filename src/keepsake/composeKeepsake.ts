// The keepsake (FR-013): the stations the visitor tuned in, in dial order, as
// one image they can save or pass on. Composed on the device, because there is
// no server to compose it on and nothing about the visitor may leave the
// device anyway (FR-020, FR-022, research R8).
import type { Broadcast, Reception } from "../domain/types";

export interface KeepsakeLine {
  frequency: number;
  name: string;
  callSign?: string;
}

const WIDTH = 1080;
const HEIGHT = 1350;

/**
 * The card's content, in dial order. Pure, so what the card *says* is testable
 * without a canvas.
 */
export function keepsakeLines(
  broadcast: Broadcast,
  receptions: readonly Reception[],
): KeepsakeLine[] {
  const received = new Set(receptions.map((reception) => reception.stationId));
  return broadcast.stations
    .filter((station) => received.has(station.id))
    .map((station) => ({
      frequency: station.frequency,
      name: station.name,
      ...(station.callSign ? { callSign: station.callSign } : {}),
    }));
}

/**
 * Draw the card. Returns null when the device will not give us a canvas — the
 * sign-off always shows the card on screen first, so a missing image costs the
 * visitor nothing but the download.
 */
export async function composeKeepsake(
  broadcast: Broadcast,
  receptions: readonly Reception[],
  palette: { bg: string; ink: string; accent: string } = {
    bg: "#0d1426",
    ink: "#e9eefb",
    accent: "#ff6ba9",
  },
): Promise<Blob | null> {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.fillStyle = palette.accent;
    ctx.font = "600 34px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText("END OF BROADCAST", 80, 130);

    ctx.fillStyle = palette.ink;
    ctx.font = "700 76px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillText(broadcast.title, 80, 230);

    ctx.fillStyle = palette.accent;
    ctx.fillRect(80, 270, WIDTH - 160, 3);

    const lines = keepsakeLines(broadcast, receptions);
    let y = 380;
    for (const line of lines) {
      ctx.fillStyle = palette.accent;
      ctx.font = "600 44px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.fillText(line.frequency.toFixed(1), 80, y);

      ctx.fillStyle = palette.ink;
      ctx.font = "400 44px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.fillText(line.name, 260, y);
      y += 82;
    }

    ctx.fillStyle = palette.ink;
    ctx.font = "400 30px system-ui, -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillText(
      `${lines.length} of ${broadcast.stations.length} stations received`,
      80,
      HEIGHT - 90,
    );

    return await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  } catch {
    return null;
  }
}

/** File name for the saved card. */
export function keepsakeFileName(): string {
  return "bells-corners-radio.png";
}
