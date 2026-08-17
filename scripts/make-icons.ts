import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Generates the PWA icons referenced by the manifest in vite.config.ts into
// public/. Committed once; re-run with `npx tsx scripts/make-icons.ts` after
// changing the artwork.

const OUT_DIR = path.resolve(import.meta.dirname, "../public");

function iconSvg(size: number, padded: boolean): string {
  // A schematic route with a marker — same visual language as the RouteMap.
  const pad = padded ? size * 0.16 : 0;
  const s = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="#1b3a2f"/>
    <g transform="translate(${pad} ${pad})">
      <path d="M ${s * 0.2} ${s * 0.85} C ${s * 0.2} ${s * 0.5} ${s * 0.8} ${s * 0.75} ${s * 0.8} ${s * 0.35}"
        fill="none" stroke="#fdfbf5" stroke-width="${s * 0.09}" stroke-linecap="round"
        stroke-dasharray="${s * 0.16} ${s * 0.1}"/>
      <circle cx="${s * 0.8}" cy="${s * 0.28}" r="${s * 0.13}" fill="#f2c94c"/>
      <circle cx="${s * 0.8}" cy="${s * 0.28}" r="${s * 0.055}" fill="#1b3a2f"/>
    </g>
  </svg>`;
}

async function write(name: string, size: number, padded: boolean): Promise<void> {
  await sharp(Buffer.from(iconSvg(size, padded)))
    .png()
    .toFile(path.join(OUT_DIR, name));
  console.log(`public/${name}`);
}

await mkdir(OUT_DIR, { recursive: true });
await write("icon-192.png", 192, false);
await write("icon-512.png", 512, false);
await write("icon-512-maskable.png", 512, true);
