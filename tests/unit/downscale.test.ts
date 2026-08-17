import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeTargetSize, downscaleToJpeg } from "../../src/camera/downscale";

// jsdom has no real canvas or createImageBitmap; both are mocked. The pure
// sizing rule is tested directly, the pipeline via the mocks.

describe("computeTargetSize", () => {
  it("caps the long edge and preserves aspect ratio (landscape)", () => {
    expect(computeTargetSize(4000, 3000, 1024)).toEqual({ width: 1024, height: 768 });
  });

  it("caps the long edge and preserves aspect ratio (portrait)", () => {
    expect(computeTargetSize(3000, 4000, 1024)).toEqual({ width: 768, height: 1024 });
  });

  it("never upscales a small image", () => {
    expect(computeTargetSize(800, 600, 1024)).toEqual({ width: 800, height: 600 });
    expect(computeTargetSize(10, 10, 1024)).toEqual({ width: 10, height: 10 });
  });

  it("rounds to whole pixels", () => {
    const { width, height } = computeTargetSize(3001, 2000, 1024);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
    expect(width).toBe(1024);
  });
});

describe("downscaleToJpeg", () => {
  let canvasSize: { width: number; height: number };
  let toBlobArgs: { type?: string; quality?: number };
  const drawImage = vi.fn();

  beforeEach(() => {
    canvasSize = { width: 0, height: 0 };
    toBlobArgs = {};
    drawImage.mockClear();

    // EXIF orientation is honoured by asking createImageBitmap to bake it in.
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async (_file: Blob, opts?: ImageBitmapOptions) => {
        expect(opts).toMatchObject({ imageOrientation: "from-image" });
        return { width: 4000, height: 3000, close: vi.fn() } as unknown as ImageBitmap;
      }),
    );

    HTMLCanvasElement.prototype.getContext = vi.fn(function (this: HTMLCanvasElement) {
      return { drawImage } as unknown as CanvasRenderingContext2D;
    }) as never;

    HTMLCanvasElement.prototype.toBlob = function (
      cb: BlobCallback,
      type?: string,
      quality?: number,
    ) {
      canvasSize = { width: this.width, height: this.height };
      toBlobArgs = { type, quality };
      cb(new Blob(["fake-jpeg"], { type: type ?? "image/png" }));
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("produces a JPEG blob at the downscaled size", async () => {
    const out = await downscaleToJpeg(new Blob(["raw"], { type: "image/jpeg" }));
    expect(out.type).toBe("image/jpeg");
    expect(canvasSize).toEqual({ width: 1024, height: 768 });
    expect(toBlobArgs.type).toBe("image/jpeg");
    expect(toBlobArgs.quality).toBeCloseTo(0.82);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1024, 768);
  });

  it("respects a custom maxEdge and quality", async () => {
    await downscaleToJpeg(new Blob(["raw"], { type: "image/jpeg" }), {
      maxEdge: 500,
      quality: 0.5,
    });
    expect(canvasSize).toEqual({ width: 500, height: 375 });
    expect(toBlobArgs.quality).toBeCloseTo(0.5);
  });

  it("does not upscale when the source is already small", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn(async () => ({ width: 640, height: 480, close: vi.fn() })),
    );
    await downscaleToJpeg(new Blob(["raw"], { type: "image/jpeg" }));
    expect(canvasSize).toEqual({ width: 640, height: 480 });
  });
});
