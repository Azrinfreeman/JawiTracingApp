import { defineConfig } from '@playwright/test';
import base from './playwright.tracing.config.js';
// Use the already confirmed production server; avoid Windows plugin teardown.
export default defineConfig({ ...base, webServer: undefined,
  outputDir: process.env.JAWI_TEST_RESULTS || 'output/verification/low-spec-tablet/test-results',
  reporter: [['line'], ['json', { outputFile: process.env.JAWI_BROWSER_REPORT || 'output/verification/low-spec-tablet/browser-results.json' }]],
});
