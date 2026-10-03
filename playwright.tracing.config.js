import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

const baseURL = process.env.JAWI_BASE_URL || 'http://127.0.0.1:4173';
export default defineConfig({ ...base,
  outputDir: process.env.JAWI_TEST_RESULTS || 'output/verification/tracing-completion/test-results',
  projects: base.projects.filter(project => project.name !== 'firefox').map(project => ({ ...project, use: { ...project.use,
    ...(process.env.JAWI_LAYOUT_DPR ? { deviceScaleFactor: Number(process.env.JAWI_LAYOUT_DPR) } : {}) } })),
  use: { ...base.use, baseURL },
  webServer: { command: 'npm run preview -- --port 4173', url: baseURL, reuseExistingServer: true },
  reporter: [['line'], ['json', { outputFile: process.env.JAWI_BROWSER_REPORT || 'output/verification/tracing-completion/browser-results.json' }]],
});
