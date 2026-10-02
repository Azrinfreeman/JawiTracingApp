import config from '../../playwright.config.js';
export default {
  ...config,
  testDir: new URL('../../tests/browser/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'),
  outputDir: new URL('./solo-duo-production-results/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'),
  use: { ...config.use, baseURL: 'http://127.0.0.1:4173' },
  webServer: { ...config.webServer, command: 'npm run preview -- --port 4173', url: 'http://127.0.0.1:4173', reuseExistingServer: true },
  projects: config.projects.filter(project => ['chromium', 'webkit'].includes(project.name)),
};
