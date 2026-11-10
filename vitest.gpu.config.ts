import { defineConfig } from "vitest/config";
import base from "./vitest.config.ts";
export default defineConfig({
  ...base,
  test: { include: ["tests/gpu/*.validation.ts"], testTimeout: 60000 },
});
