import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { tour } from "../src/content/tour";

// Generates the camera fixtures Playwright feeds into the snap file input
// (`setInputFiles`): one 800×600 JPEG per place, labelled with the place name,
// plus none-1.jpg (a photo of nothing on the tour). See tests/fixtures/README.md.

const OUT_DIR = path.resolve(import.meta.dirname, "../tests/fixtures");
const COLOURS = [
  "#1b6b3a",
  "#9a3b00",
  "#0b57d0",
  "#6a1b9a",
  "#00695c",
  "#8d6e63",
  "#37474f",
  "#ad1457",
  "#4e342e",
  "#33691e",
];

function fixtureSvg(label: string, colour: string): string {
  const escaped = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="800" height="600" fill="${colour}"/>
    <rect x="40" y="40" width="720" height="520" fill="none" stroke="#ffffff" stroke-width="6"/>
    <text x="400" y="280" text-anchor="middle" font-family="DejaVu Sans, sans-serif"
      font-size="52" font-weight="bold" fill="#ffffff">${escaped}</text>
    <text x="400" y="360" text-anchor="middle" font-family="DejaVu Sans, sans-serif"
      font-size="30" fill="#ffffff">test fixture photo</text>
  </svg>`;
}

async function write(file: string, label: string, colour: string): Promise<void> {
  await sharp(Buffer.from(fixtureSvg(label, colour)))
    .jpeg({ quality: 80 })
    .toFile(file);
  console.log(path.relative(process.cwd(), file));
}

await mkdir(path.join(OUT_DIR, "places"), { recursive: true });

for (const [i, place] of tour.places.entries()) {
  await write(
    path.join(OUT_DIR, "places", `${place.id}-1.jpg`),
    place.name,
    COLOURS[i % COLOURS.length]!,
  );
}
await write(path.join(OUT_DIR, "none-1.jpg"), "Not on the tour", "#5c6b62");
