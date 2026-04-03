import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // vite.config.ts
  css: {
    preprocessorOptions: {
      scss: {
        // Use a single line or a template literal to ensure order
        additionalData: `
        @use "@/styles/_variables.scss" as *;
        @use "@/styles/_typography.scss" as *;
      `,
      },
    },
  },
});
