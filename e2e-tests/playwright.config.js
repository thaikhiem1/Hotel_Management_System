import { defineConfig, devices } from "@playwright/test";
const FRONTEND_URL = "http://localhost:5173";
const BACKEND_URL = "http://localhost:8080";
const slowMo = Number(process.env.SLOWMO || 0);

export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  expect: { timeout: 7_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],

  // ====== GHI LẠI THAO TÁC ======
  use: {
    baseURL: FRONTEND_URL,
    video: "on", // quay video từng test
    trace: "on", // trace viewer: xem lại từng bước (DOM, network, console)
    screenshot: "on", // chụp ảnh cuối mỗi test
    launchOptions: { slowMo }, // làm chậm thao tác khi demo
    viewport: { width: 1280, height: 720 },
  },

  projects: [
    {
      name: "chromium",
      testDir: "./tests/ui",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      testDir: "./tests/ui",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      testDir: "./tests/ui",
      use: { ...devices["Desktop Safari"] },
    },

    {
      name: "e2e-chromium",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "e2e-firefox",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "e2e-webkit",
      testDir: "./tests/e2e",
      use: { ...devices["Desktop Safari"] },
    },

    { name: "api", testDir: "./tests/api", use: { baseURL: BACKEND_URL } },
  ],
});
