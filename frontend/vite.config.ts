import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// @tripper/shared ships raw TS (no build step), so alias it to source and let
// Vite transform it — otherwise the bare workspace import fails to resolve in the browser.
const sharedSrc = fileURLToPath(new URL("../shared/src", import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Keep the service worker out of dev — a cached SW intercepts navigation
      // and /api calls, serving stale builds during local development.
      devOptions: { enabled: false },
      manifest: {
        name: "Tripper",
        short_name: "Tripper",
        description: "Mobile-first trip planner",
        theme_color: "#0d9488",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@tripper/shared": `${sharedSrc}/index.ts`,
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
    },
    fs: { allow: [sharedSrc, fileURLToPath(new URL(".", import.meta.url))] },
  },
});
