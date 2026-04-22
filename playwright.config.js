import { defineConfig, devices } from '@playwright/test';
import { loadConfig } from './lib/config.js';

const cfg = loadConfig();

export default defineConfig({
  testDir: './tests',
  /** External ParaBank UI — enough headroom without keeping slow tests near the limit. */
  timeout: 60_000,
  globalSetup: './global-setup.js',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    locale: 'en-US',
    headless: cfg.isHeadless(),
    launchOptions: {
      slowMo: cfg.getSlowMoMs(),
    },
    actionTimeout: cfg.defaultTimeoutMs(),
    navigationTimeout: cfg.navigationTimeoutMs(),
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium' }],
});
