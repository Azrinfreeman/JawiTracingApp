// Separate test bundles; never imported by the app.
import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {writeFileSync} from 'node:fs';
process.env.JAWI_OUTLINE_HARNESS_DIR='output/verification/mim-reference';
await import('./build-outline-test-harness.mjs');
const result=await build({configFile:false,plugins:[react()],define:{'process.env.NODE_ENV':JSON.stringify('production')},logLevel:'error',build:{write:false,lib:{entry:'tests/browser/fixtures/mimReferenceGlyphHarness.jsx',formats:['iife'],name:'MimGlyphTest'},minify:true}});
const bundle=Array.isArray(result)?result[0]:result;
writeFileSync('output/verification/mim-reference/glyph-harness.js',bundle.output.find(o=>o.type==='chunk').code);
console.log('Built Mim card/help test harness.');
