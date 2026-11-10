import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testDir: "tests/gpu",
  outputDir: "artifacts/test-results-gpu",
  timeout: 180000,
});
