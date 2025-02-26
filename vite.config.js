import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000, // 2000kB로 임계값 상향 (기본 500kB)
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"], // React 라이브러리 분리
        },
      },
    },
  },
});
