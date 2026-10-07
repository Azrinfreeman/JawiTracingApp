import {build} from 'vite';
import react from '@vitejs/plugin-react';
import {mkdirSync,writeFileSync} from 'node:fs';
const result=await build({configFile:false,plugins:[react()],define:{'process.env.NODE_ENV':JSON.stringify('production')},logLevel:'error',build:{write:false,lib:{entry:'tests/browser/fixtures/outlineMatchHarness.jsx',formats:['iife'],name:'OutlineTest'},minify:true}});
const root=process.env.JAWI_OUTLINE_HARNESS_DIR||'output/verification/four-letter-outlines';
mkdirSync(root,{recursive:true});
const bundle=Array.isArray(result)?result[0]:result;
writeFileSync(`${root}/test-harness.js`,bundle.output.find(o=>o.type==='chunk').code);
console.log('Built separate test-only harness from the current components.');
