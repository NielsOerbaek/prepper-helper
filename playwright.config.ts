import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for mobile testing.
 * Run with: npm run test:mobile
 *
 * For testing on a real mobile device, run:
 *   npm run test:mobile -- --headed
 *
 * This will open a browser that you can access from your mobile device
 * by navigating to http://<your-ip>:3000
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // Base URL for the dev server
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Capture screenshots and traces on failure
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Mobile device emulation
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'Mobile Safari (Large)',
      use: { ...devices['iPhone 14 Pro Max'] },
    },

    // Tablet devices
    {
      name: 'iPad',
      use: { ...devices['iPad Pro 11'] },
    },

    // Desktop (for comparison)
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
