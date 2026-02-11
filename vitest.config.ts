import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    coverage: {
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "src/proxy.ts",
        "src/shared/api/database.ts",
        "src/shared/api/repositories.ts",
        "src/shared/api/types.ts",
        "src/shared/api/seed-factories/**",
        "src/**/index.ts",
        "src/**/*.stories.tsx",
        "src/app/**/*.tsx",
        "scripts/**",
      ],
      reporter: ["text", "json", "json-summary", "clover", "lcov"],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
    environment: "happy-dom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
