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
        // FR-012: the whole drive must work offline after first load, so the
        // app shell, the authored content bundle and every place visual are
        // precached rather than left to the HTTP cache.
        globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp,woff2}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: "Bells Corners Drive-Through Tour",
        short_name: "Bells Corners",
        description:
          "A short ride-along tour of Bells Corners — snap each place to unlock its story.",
        start_url: base,
        scope: base,
        display: "standalone",
        orientation: "portrait",
        background_color: "#fdfbf5",
        theme_color: "#1b3a2f",
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
