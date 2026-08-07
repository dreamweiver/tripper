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
      manifest: {
        name: "Tripper",
        short_name: "Tripper",
        description: "Mobile-first trip planner",
        theme_color: "#2d6cdf",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
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
    fs: { allow: [sharedSrc, fileURLToPath(new URL(".", import.meta.url))] },
  },
});
