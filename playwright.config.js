import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', testIgnore: '**/touch.spec.js', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', testIgnore: '**/touch.spec.js', use: { ...devices['Desktop Safari'] } },
  ],
});
