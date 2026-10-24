import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "superpowers", "anti-slop"],
    // PGlite memuat PostgreSQL versi WASM. Proses boot-nya berat, apalagi
    // bila beberapa file test berjalan paralel dan berebut CPU. Karena itu
    // test dijalankan berurutan dalam satu worker dengan timeout longgar.
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
        minThreads: 1,
        maxThreads: 1,
      },
    },
    hookTimeout: 120000,
    testTimeout: 60000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
