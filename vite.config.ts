import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// `base` lets the same build serve from a GitHub Pages project path
// (VITE_BASE=/neighbourhood_tour/) or from a domain root (default "/").
const base = process.env.VITE_BASE ?? "/";

// The page is rendered to HTML at build time (scripts/prerender.ts), so the
// browser is never sent a React runtime. The dev server has no such step, which
// would leave `npm run dev` serving an empty <div id="root"> — a black screen.
// This does the same render on the fly so dev matches what ships.
const prerenderInDev = (): Plugin => ({
  name: "prerender-in-dev",
  apply: "serve",
  transformIndexHtml: {
    order: "pre",
    async handler(html, ctx) {
      if (!ctx.server) return html;
      const { render } = (await ctx.server.ssrLoadModule("/src/entry-server.tsx")) as {
        render: () => string;
      };
      return html.replace('<div id="root"></div>', `<div id="root">${render()}</div>`);
    },
  },
});

export default defineConfig({
  base,
  // host: true so a phone on the same Wi-Fi can open the LAN URL (quickstart.md).
  server: { host: true },
  preview: { host: true },
  build: { target: "es2022" },
  plugins: [
    react(),
    prerenderInDev(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // registered explicitly in src/main.tsx
      workbox: {
        // FR-017: the whole page must work offline after first load, so the
        // app shell, the authored content, every image variant and the
        // vendored font are precached rather than left to the HTTP cache.
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,avif,woff2}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: "Bells Corners — The Expedition",
        short_name: "Bells Corners",
        description:
          "An expedition through Bells Corners — six stops in the village I grew up in.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#12100e",
        theme_color: "#12100e",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
