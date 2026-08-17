// Downscale a camera photo before storing it (research R4): ≤1024 px long
// edge keeps IndexedDB small and recap composition fast. EXIF orientation is
// baked in by createImageBitmap so portrait shots stay portrait.

export interface DownscaleOptions {
  maxEdge?: number;
  quality?: number;
}

/** Pure sizing rule: cap the long edge, preserve aspect, never upscale. */
export function computeTargetSize(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export async function downscaleToJpeg(
  file: Blob,
  { maxEdge = 1024, quality = 0.82 }: DownscaleOptions = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const { width, height } = computeTargetSize(bitmap.width, bitmap.height, maxEdge);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("2d canvas context unavailable");
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) throw new Error("canvas.toBlob produced no image");
    return blob;
  } finally {
    bitmap.close?.();
  }
}
