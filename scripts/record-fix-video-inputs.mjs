import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
const sha=data=>createHash('sha256').update(data).digest('hex');
const root='output/verification/fix-video-implementation';
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(folder,entry.name)):[join(folder,entry.name).replaceAll('\\','/')]);
const files=[...walk('src'),...walk('tests'),...walk('dist/assets').filter(path=>/index-.*\.(js|css)$/.test(path)),
  'package.json','package-lock.json','playwright.config.js','scripts/verify-fix-video-models.mjs',
  'scripts/create-fix-video-review.mjs','scripts/verify-fix-video-review.mjs'];
const catalogue=readFileSync('src/content/letters.json'),letters=JSON.parse(catalogue);
const recordings=letters.map(letter=>letter.audio.name.src).filter(Boolean).map(src=>`public${src}`);
const hashes=Object.fromEntries([...new Set([...files,...recordings])].map(path=>[path,sha(readFileSync(path))]));
const baseline=execFileSync('git',['show','HEAD:src/content/letters.json']);
if(sha(catalogue)!==sha(baseline))throw new Error('Protected student catalogue changed');
writeFileSync(`${root}/inputs.json`,JSON.stringify({date:new Date().toISOString(),node:process.version,
  build:'fix-video-20261006',catalogueUnchangedFromHead:true,models:letters.length,
  approvedGeometry:letters.filter(l=>l.geometry.status==='approved').length,
  approvedAudio:letters.filter(l=>l.audio.name.status==='approved').length,hashes},null,2));
console.log('Recorded source/test/bundle/recording hashes; 37 student geometry and audio approvals unchanged.');
