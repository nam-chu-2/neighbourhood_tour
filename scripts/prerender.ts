// Injects the build-time rendered HTML into dist/index.html.
//
// Without this the page is an empty <div id="root"> until JavaScript runs —
// which would make the reveal's "can never blank the page" guarantee (research
// R1) meaningless, since React itself would be the thing blanking it.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(import.meta.dirname, "..");
const INDEX = resolve(ROOT, "dist/index.html");
const SSR_ENTRY = resolve(ROOT, "dist-ssr/entry-server.js");

const { render } = (await import(pathToFileURL(SSR_ENTRY).href)) as { render: () => string };
const html = render();

const template = readFileSync(INDEX, "utf8");
const marker = '<div id="root"></div>';
if (!template.includes(marker)) {
  console.error(`✗ could not find ${marker} in dist/index.html`);
  process.exit(1);
}

writeFileSync(INDEX, template.replace(marker, `<div id="root">${html}</div>`));
rmSync(resolve(ROOT, "dist-ssr"), { recursive: true, force: true });

console.log(`prerendered ${(html.length / 1024).toFixed(1)} kB of HTML into dist/index.html`);
