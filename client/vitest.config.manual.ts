/// <reference types="vitest/config" />

import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@components": path.resolve(__dirname, "./src/components"),
    },
  },
  test: {
    exclude: ["node_modules/**"],
    silent: "passed-only",
    typecheck: {
      enabled: true,
    },
    printConsoleTrace: true,
  },
});
