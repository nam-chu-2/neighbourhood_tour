import type { Find, Tour } from "../domain/types";

// FR-009 / research R8: the keepsake is one canvas-composed JPEG — the
// visitor's own photos in route order with place names, the tour title and
// the closing note. Composed entirely on-device.

export const RECAP_WIDTH = 1080;

export interface RecapLayout {
  width: number;
  height: number;
  cols: number;
  rows: number;
  padding: number;
  gap: number;
  tileW: number;
  photoH: number;
  captionH: number;
  tileH: number;
  header: number;
  footer: number;
}

export function recapLayout(count: number): RecapLayout {
  const cols = 2;
  const padding = 48;
  const gap = 24;
  const header = 150;
  const footer = 170;
  const tileW = (RECAP_WIDTH - padding * 2 - gap * (cols - 1)) / cols;
  const photoH = 360;
  const captionH = 56;
  const tileH = photoH + captionH;
  const rows = Math.max(1, Math.ceil(count / cols));
  const height = header + rows * tileH + (rows - 1) * gap + footer;
  return {
    width: RECAP_WIDTH,
    height,
    cols,
    rows,
    padding,
    gap,
    tileW,
    photoH,
    captionH,
    tileH,
    header,
    footer,
  };
}

const FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: ImageBitmap,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const scale = Math.max(w / image.width, h / image.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (image.width - sw) / 2;
  const sy = (image.height - sh) / 2;
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

export async function composeRecap(finds: Find[], tour: Tour): Promise<Blob> {
  const placeById = new Map(tour.places.map((place) => [place.id, place]));
  const sorted = finds
    .filter((find) => placeById.has(find.placeId))
    .sort((a, b) => placeById.get(a.placeId)!.order - placeById.get(b.placeId)!.order);

  const layout = recapLayout(sorted.length);
  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d canvas context unavailable");

  // Background + header
  ctx.fillStyle = "#fdfbf5";
  ctx.fillRect(0, 0, layout.width, layout.height);
  ctx.fillStyle = "#1b3a2f";
  ctx.font = `bold 46px ${FONT}`;
  ctx.fillText(tour.title, layout.padding, 78, layout.width - layout.padding * 2);
  ctx.fillStyle = "#565248";
  ctx.font = `26px ${FONT}`;
  ctx.fillText(
    "Your ride, in your own photos",
    layout.padding,
    120,
    layout.width - layout.padding * 2,
  );

  // Tiles in route order
  for (const [index, find] of sorted.entries()) {
    const place = placeById.get(find.placeId)!;
    const col = index % layout.cols;
    const row = Math.floor(index / layout.cols);
    const x = layout.padding + col * (layout.tileW + layout.gap);
    const y = layout.header + row * (layout.tileH + layout.gap);

    if (find.photo) {
      const bitmap = await createImageBitmap(find.photo);
      drawCover(ctx, bitmap, x, y, layout.tileW, layout.photoH);
      bitmap.close?.();
    } else {
      ctx.fillStyle = "#e9e4d6";
      ctx.fillRect(x, y, layout.tileW, layout.photoH);
      ctx.fillStyle = "#565248";
      ctx.font = `26px ${FONT}`;
      ctx.fillText("No photo — found it anyway", x + 24, y + layout.photoH / 2);
    }

    ctx.fillStyle = "#1c1b18";
    ctx.font = `600 28px ${FONT}`;
    ctx.fillText(
      `${place.order}. ${place.name}`,
      x,
      y + layout.photoH + 38,
      layout.tileW,
    );
  }

  // Footer: closing note
  ctx.fillStyle = "#565248";
  ctx.font = `italic 24px ${FONT}`;
  ctx.fillText(
    tour.closingNote,
    layout.padding,
    layout.height - layout.footer + 70,
    layout.width - layout.padding * 2,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9),
  );
  if (!blob) throw new Error("canvas.toBlob produced no image");
  return blob;
}
