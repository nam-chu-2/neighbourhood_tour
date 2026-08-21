import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// `base` lets the same build serve from a GitHub Pages project path
// (VITE_BASE=/neighbourhood_tour/) or from a domain root (default "/").
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  base,
  // host: true so a phone on the same Wi-Fi can open the LAN URL (quickstart.md).
  server: { host: true },
  preview: { host: true },
  build: { target: "es2022" },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // registered explicitly in src/main.tsx
      workbox: {
        // FR-019: the whole tour must work offline after first load, so the
        // app shell, the authored content bundle, every station visual and the
        // noise texture are precached rather than left to the HTTP cache.
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: "Bells Corners Radio",
        short_name: "BC Radio",
        description:
          "Tune the dial through Bells Corners — every station is a place I grew up with.",
        start_url: base,
        scope: base,
        display: "standalone",
        background_color: "#101828",
        theme_color: "#101828",
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
