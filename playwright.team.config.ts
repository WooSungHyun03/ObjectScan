// Team (no keys/DB/GPU/PG) fixture regression. Owner real-service suites stay in playwright.config.ts.
import { defineConfig, devices } from "@playwright/test";
const viewports = {
  "360": [360, 800],
  "768": [768, 1024],
  "1440": [1440, 1000],
} as const;
export default defineConfig({
  testDir: "tests/team",
  outputDir: "test-results/team",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:4317",
    trace: "retain-on-failure",
    // Software WebGL, same as playwright.config.ts, so the 3D viewer renders headless.
    launchOptions: {
      args: [
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  projects: Object.entries(viewports).map(([name, [width, height]]) => ({
    name,
    use: { ...devices["Desktop Chrome"], viewport: { width, height } },
  })),
  webServer: {
    // env -i: prove the shell needs no .env / keys at all.
    command:
      'env -i PATH="$PATH" HOME="$HOME" npx vite --config tests/team/vite.config.ts',
    url: "http://127.0.0.1:4317",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
