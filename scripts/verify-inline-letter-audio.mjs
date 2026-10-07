import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';
import {validateCatalogue} from '../src/content/validateContent.js';

const root='output/verification/inline-letter-audio';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const letters=read('src/content/letters.json');
strictEqual(hash('src/content/letters.json'),hash(`${root}/before-catalogue.json`),'Catalogue changed during this UI task');
const previous=read('output/verification/fa-pa-approval/inputs.json');
const recordings=letters.map(letter=>`public${letter.audio.name.src}`);
for(const path of recordings)strictEqual(hash(path),previous.hashes[path],`Recording changed: ${path}`);
const content=validateCatalogue(letters);ok(content.valid);
strictEqual(content.results.filter(result=>result.ready).length,37);
const reports=['browser-final.json','browser-regression.json'].map(name=>{
  const path=`${root}/${name}`,report=read(path);
  strictEqual(report.stats.unexpected,0);strictEqual(report.stats.flaky,0);
  return {path,passed:report.stats.expected,skipped:report.stats.skipped,failed:report.stats.unexpected};
});
strictEqual(reports[0].passed,25);strictEqual(reports[0].skipped,1);
strictEqual(reports[1].passed,30);strictEqual(reports[1].skipped,0);
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{
  const path=`${folder}/${entry.name}`;return entry.isDirectory()?walk(path):[path];
});
const files=[...walk('src'),...walk('tests'),...walk('dist'),...recordings,'package.json','package-lock.json',
  'playwright.config.js','scripts/verify-inline-letter-audio.mjs',`${root}/before-catalogue.json`,...reports.map(r=>r.path)];
writeFileSync(`${root}/inputs.json`,JSON.stringify({date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,
  build:'inline-letter-audio-20261006',catalogueByteIdentical:true,recordingsPreserved:recordings.length,studentReady:37,
  browser:reports,hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))},null,2)+'\n');
console.log('Verified unchanged catalogue, 37 preserved recordings and 37 ready lessons; recorded final browser reports and input fingerprints.');
