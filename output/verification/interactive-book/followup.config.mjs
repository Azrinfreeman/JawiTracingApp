import base from './playwright.config.mjs';
import { fileURLToPath } from 'node:url';
export default { ...base,
  outputDir: fileURLToPath(new URL('./followup-results', import.meta.url)),
  reporter: [['dot'], ['json', { outputFile: fileURLToPath(new URL('./browser-followup.json', import.meta.url)) }]],
};
