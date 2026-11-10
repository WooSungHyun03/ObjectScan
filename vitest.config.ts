import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts", "packages/**/*.test.ts"],
    testTimeout: 20000,
  },
  resolve: {
    alias: {
      "server-only": new URL("./tests/empty-server-only.ts", import.meta.url)
        .pathname,
      "@objectscan/shared": new URL(
        "./packages/shared/src/index.ts",
        import.meta.url,
      ).pathname,
      "@": new URL("./apps/web/src", import.meta.url).pathname,
    },
  },
});
