import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root='output/verification/tablet-smartboard-performance';
const read=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const before=read(`${root}/content-before.json`);
assert.equal(hash('src/content/letters.json'),before.Hash.toLowerCase(),'Approved content changed');
const audio=read(`${root}/audio-before.json`);
for(const file of audio)assert.equal(hash(file.Path),file.Hash.toLowerCase(),`Audio changed: ${file.Path}`);
const reports=['browser-results','followup-browser-results','history-browser-results'];
const cases=new Map(),history=[];
for(const report of reports){
  const data=read(`${root}/${report}.json`);history.push({report,stats:data.stats});
  const visit=suite=>{
    for(const spec of suite.specs||[])for(const test of spec.tests){
      const key=JSON.stringify([spec.file,spec.title,test.projectName]);
      cases.set(key,{file:spec.file,title:spec.title,project:test.projectName,status:test.results.at(-1)?.status});
    }
    for(const child of suite.suites||[])visit(child);
  };
  data.suites.forEach(visit);
}
const latest=[...cases.values()],failed=latest.filter(test=>!['passed','skipped'].includes(test.status));
assert.deepEqual(failed,[],'Unresolved browser cases');
const walk=path=>readdirSync(path,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${path}/${entry.name}`):[`${path}/${entry.name}`]);
const files=[...walk('src'),...walk('tests'),'package.json','package-lock.json','playwright.config.js','playwright.performance.config.js','playwright.tracing.config.js',
  'scripts/measure-tracing.js','scripts/measure-tracing-preparation.js','scripts/compare-tracing-performance.js','scripts/verify-tablet-performance.js',...walk('dist').filter(path=>/\.(js|css|html)$/.test(path))];
const result={date:new Date().toISOString(),contentSha256:hash('src/content/letters.json'),audioFilesUnchanged:audio.length,
  browserCases:{passed:latest.filter(test=>test.status==='passed').length,skipped:latest.filter(test=>test.status==='skipped').length,unresolved:failed.length},
  reports:history,cases:latest,inputs:Object.fromEntries(files.map(path=>[path,hash(path)])),
  scope:'Final source/build fingerprints and approved content/audio integrity; browser totals use the latest result for each named case and project. Historical failed runs remain preserved. Unit/build command results are recorded in the verification document.'};
writeFileSync(`${root}/verification.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({contentUnchanged:true,audioFilesUnchanged:audio.length,browserCases:result.browserCases,inputFiles:files.length}));
