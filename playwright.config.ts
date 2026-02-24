import { defineConfig, devices } from "@playwright/test";

const CI_WEB_SERVER_COMMAND = "npm run start";
const LOCAL_WEB_SERVER_COMMAND = "npm run build && npm run start";
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const VERCEL_AUTOMATION_BYPASS_SECRET =
  process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html"], ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: BASE_URL,
    extraHTTPHeaders: VERCEL_AUTOMATION_BYPASS_SECRET
      ? {
          "x-vercel-protection-bypass": VERCEL_AUTOMATION_BYPASS_SECRET,
        }
      : {},

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: process.env.CI
          ? CI_WEB_SERVER_COMMAND
          : LOCAL_WEB_SERVER_COMMAND,
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI || !!process.env.REUSE_SERVER,
        timeout: 120000,
      },
});
