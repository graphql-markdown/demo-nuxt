import { defineConfig, devices } from "@playwright/test";

// Stabilize font rendering across machines (recommended by Argos).
const launchOptions = {
  args: ["--disable-lcd-text", "--font-render-hinting=none"],
};

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    [process.env.CI ? "dot" : "list"],
    [
      "@argos-ci/playwright/reporter",
      { uploadToArgos: !!process.env.CI && !!process.env.ARGOS_TOKEN },
    ],
  ],
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions } },
  ],
  webServer: {
    // Static output of `pnpm run generate`; build it before running tests.
    command: "pnpm exec serve -l 4173 .output/public",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    env: { NO_UPDATE_CHECK: "1" },
  },
});
