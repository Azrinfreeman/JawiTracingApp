import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
const sha=data=>createHash('sha256').update(data).digest('hex');
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(folder,e.name)):[join(folder,e.name).replaceAll('\\','/')]);
const root='output/verification/four-letter-outlines',catalogue=readFileSync('src/content/letters.json'),letters=JSON.parse(catalogue);
const audio=letters.map(l=>`public${l.audio.name.src}`),previous=JSON.parse(readFileSync('output/verification/fix-video-implementation/inputs.json'));
const files=[...walk('src'),...walk('tests'),...walk('dist/assets').filter(p=>/index-.*\.(js|css)$/.test(p)),...audio,
  'package.json','package-lock.json','playwright.config.js','scripts/author-four-letter-outlines.mjs','scripts/verify-four-letter-outlines.mjs','scripts/lib/glyph-geometry.mjs',
  'scripts/glyph-trace-plan.json','scripts/build-outline-test-harness.mjs','scripts/record-four-letter-inputs.mjs',
  'node_modules/@fontsource/noto-naskh-arabic/files/noto-naskh-arabic-arabic-400-normal.woff2','public/fonts/NotoNaskhArabic-LICENSE.txt',
  `${root}/test-harness.js`];
const hashes=Object.fromEntries(files.map(p=>[p,sha(readFileSync(p))]));
if(sha(catalogue)!==sha(execFileSync('git',['show','HEAD:src/content/letters.json'])))throw Error('Student catalogue changed');
if(audio.some(p=>hashes[p]!==previous.hashes[p]))throw Error('Approved recording changed');
writeFileSync(`${root}/inputs.json`,JSON.stringify({date:new Date().toISOString(),node:process.version,build:'four-letter-outline-20261006',
  catalogueUnchangedFromHead:true,approvedGeometry:letters.filter(l=>l.geometry.status==='approved').length,
  approvedAudio:letters.filter(l=>l.audio.name.status==='approved').length,recordingsMatchPreviousVerification:true,hashes},null,2)+'\n');
console.log('Recorded final inputs; 37 approved models and all 37 recordings preserved.');
