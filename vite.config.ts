import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/three/"))
            return id.includes("three.core") ? "three-core" : "three-renderer";
        },
      },
    },
  },
});
