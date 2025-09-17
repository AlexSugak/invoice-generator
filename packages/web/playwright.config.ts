import { PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, 'test/e2e/auth.json');

const config: PlaywrightTestConfig = {
  timeout: 3000,
  testDir: './test/e2e',
  globalSetup: './test/e2e/setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    storageState: authFile,
  },
  testMatch: '**/*.spec.ts',
  reporter: 'html',
  outputDir: 'test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
};

export default config;
