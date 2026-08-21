// Generates the tiled noise texture used for the off-station "static"
// (research R3: the static is a composited texture, never per-frame canvas
// noise). Run with `npm run noise`. The output is committed so a fresh clone
// builds without running this script.
//
// Kept deliberately small: a 64px tile stays under the 8 kB budget in plan.md
// while tiling seamlessly at any viewport size.
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const SIZE = 64;
const OUT = resolve(import.meta.dirname, "../src/content/media/noise.png");
const BUDGET_BYTES = 8 * 1024;

// Deterministic PRNG so re-running the script does not churn the committed
// asset (mulberry32).
function random(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const next = random(0x8e11c0de);
const pixels = Buffer.alloc(SIZE * SIZE);
for (let i = 0; i < pixels.length; i += 1) {
  // Mid-weighted grain: pure white noise reads as television snow, which is
  // exactly the reference the dial is borrowing.
  pixels[i] = Math.round(next() * 255);
}

mkdirSync(dirname(OUT), { recursive: true });
const png = await sharp(pixels, { raw: { width: SIZE, height: SIZE, channels: 1 } })
  .png({ compressionLevel: 9, palette: true, colours: 32 })
  .toBuffer();

writeFileSync(OUT, png);
const { size } = statSync(OUT);
console.log(`wrote ${OUT} (${size} bytes)`);
if (size > BUDGET_BYTES) {
  console.error(`noise texture is over the ${BUDGET_BYTES} byte budget`);
  process.exit(1);
}
