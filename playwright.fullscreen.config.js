import { defineConfig } from '@playwright/test';
import base from './playwright.config.js';

// Exercise the compiled game, reusing an existing preview when available.
export default defineConfig({ ...base,
  projects: base.projects.map(project => ({ ...project, use: { ...project.use,
    ...(process.env.JAWI_LAYOUT_DPR ? { deviceScaleFactor: Number(process.env.JAWI_LAYOUT_DPR) } : {}) } })),
  projects: base.projects.map(project => ({ ...project, use: { ...project.use,
    ...(process.env.JAWI_LAYOUT_DPR ? { deviceScaleFactor: Number(process.env.JAWI_LAYOUT_DPR) } : {}) } })),
  use: { ...base.use, baseURL: 'http://127.0.0.1:4173' },
  webServer: { command: 'npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  reporter: [['line'], ['json', { outputFile: process.env.JAWI_BROWSER_REPORT || 'output/verification/fullscreen-layout/browser-results.json' }]],
});
