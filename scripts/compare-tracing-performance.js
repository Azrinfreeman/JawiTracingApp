import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const root=process.argv[2]||'output/verification/tablet-smartboard-performance';
const read=name=>JSON.parse(readFileSync(`${root}/${name}.json`,'utf8'));
const median=values=>[...values].sort((a,b)=>a-b)[Math.floor(values.length/2)];
const rows=[];
for(const name of ['tablet','4k','4k-full','duo']) {
  const before=read(`baseline-${name}`),after=read(`after-${name}`);
  assert.equal(before.results.length,after.results.length);
  for(let i=0;i<before.results.length;i++){
    const a=before.results[i],b=after.results[i];
    for(const field of ['label','repetition','samples','profile','phases','replay'])assert.deepEqual(b[field],a[field],`${name} ${a.label} ${field}`);
  }
  for(const label of new Set(before.results.map(r=>r.label))) {
    const a=before.results.filter(r=>r.label===label),b=after.results.filter(r=>r.label===label);
    const metrics=Object.fromEntries(['batchMs','rafWorkMs','frameIntervalMs'].map(key=>[key,{before:median(a.map(r=>r[key].p95)),after:median(b.map(r=>r[key].p95)),beforeRange:a.map(r=>r[key].p95),afterRange:b.map(r=>r[key].p95)}]));
    rows.push({case:name,label,viewport:a[0].viewport,runs:a.length,metrics,
      attributeWrites:{before:median(a.map(r=>r.attributeWrites)),after:median(b.map(r=>r.attributeWrites))},
      longTasks:{before:a.reduce((sum,r)=>sum+r.longTaskMs.length,0),after:b.reduce((sum,r)=>sum+r.longTaskMs.length,0)}});
  }
}
const preparation={before:read('baseline-preparation').results,after:read('after-preparation').results};
const comparison={date:new Date().toISOString(),replay:'Same sample counts, logical ink hashes, progress, completed parts, metrics and profiles for all Solo runs; both Duo boards complete. Timing is excluded from replay equality.',rows,preparation};
writeFileSync(`${root}/comparison.json`,JSON.stringify(comparison,null,2));
console.log(JSON.stringify({replay:comparison.replay,rows:rows.map(r=>({case:r.case,label:r.label,metrics:r.metrics,attributeWrites:r.attributeWrites,longTasks:r.longTasks})),restart:preparation.after.map(r=>({label:r.label,...r.restart}))},null,2));
