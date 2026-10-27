import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true, // Allows using describe, it, expect without importing them
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
  resolve: {
    alias: {
      "@config": path.resolve(import.meta.dirname, "./src/config"),
      "@common": path.resolve(import.meta.dirname, "./src/common"),
      "@modules": path.resolve(import.meta.dirname, "./src/modules"),
      "@lib": path.resolve(import.meta.dirname, "./src/lib"),
      "@infrastructure": path.resolve(import.meta.dirname, "./src/infrastructure"),
      "@generated": path.resolve(import.meta.dirname, "./src/generated"),
    },
  },
});
