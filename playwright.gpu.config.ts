import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({ ...base, testDir: "tests/gpu", timeout: 180000 });
