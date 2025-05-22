/* vite.config.ts --------------------------------------------------- */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => {
  const isDev     = command === "serve";
  const tauriPort = process.env.TAURI_DEV_PORT
                    ? Number(process.env.TAURI_DEV_PORT)
                    : 1420;

  return {
    plugins: [react()],

    resolve: {
      dedupe: ["@emotion/react", "@emotion/styled"],
    },
   
    server: {
      port: isDev ? tauriPort : 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    base: command === "build" ? "./" : "/",
    build: {
      target: "es2020",
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id
                .split("node_modules/")[1]
                .split("/")[0]
                .replace("@", "at-");
            }
          },
        },
      },
    },
  };
});
