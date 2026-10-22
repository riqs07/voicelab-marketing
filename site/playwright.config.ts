import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3166);

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: "line",
  use: {
    baseURL: `http://localhost:${PORT}`,
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  webServer: {
    command: `pnpm exec next start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    // No Buttondown key in tests: the real route must refuse politely
    env: { BUTTONDOWN_API_KEY: "" },
  },
});
