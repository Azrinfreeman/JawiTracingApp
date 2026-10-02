import base from '../../../playwright.config.js';
import { fileURLToPath } from 'node:url';
export default {
  ...base,
  testDir: fileURLToPath(new URL('../../../tests/browser', import.meta.url)),
  outputDir: fileURLToPath(new URL('./test-results', import.meta.url)),
  use: { ...base.use, baseURL: 'http://127.0.0.1:4173' },
  webServer: undefined,
  reporter: [['dot'], ['json', { outputFile: fileURLToPath(new URL('./browser-results.json', import.meta.url)) }]],
};
