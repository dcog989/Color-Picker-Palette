import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [svelte()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx,svelte}"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        ".svelte-kit/",
        "**/types.ts",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/constants.ts",
        "**/data/**",
        // Canvas rendering needs a real browser; logic lives in tested utils.
        "**/visual-strategies.ts",
        // Runes state needs a component harness; logic lives in tested utils.
        "**/stores/**",
        // Worker entry points; the algorithms live in src/lib/utils.
        "**/workers/**",
        // Thin Svelte context wrapper.
        "**/context.ts",
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
