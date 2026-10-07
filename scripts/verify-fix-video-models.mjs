import {chromium} from '@playwright/test';
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {makeReference, pointAt} from '../src/tracing/geometry.js';
import {createPlayMatcher} from '../src/tracing/playMatcher.js';
import {getProfile} from '../src/tracing/profiles.js';
import {videoReviewCandidates} from '../src/content/reviewCandidates.js';
const source=readFileSync('src/content/letters.json'), letters=JSON.parse(source);
const candidates=videoReviewCandidates(letters).map(item=>item.candidate);
const browser=await chromium.launch(), page=await browser.newPage();
const models=await page.evaluate(letters=>letters.map(l=>({id:l.id,version:l.contentVersion,strokes:l.geometry.strokes.map(s=>{
  const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',s.path);
  const length=p.getTotalLength(), n=Math.ceil(length/2);
  return {id:s.id,points:Array.from({length:n+1},(_,i)=>{const q=p.getPointAtLength(i*length/n);return {x:q.x,y:q.y};})};
})})),[...letters,...candidates]);await browser.close();
const results=[];
for(const letter of [...letters,...candidates]) {
  const refs=Object.fromEntries(models.find(m=>m.id===letter.id&&m.version===letter.contentVersion).strokes.map(s=>[s.id,makeReference(s.points)]));
  for(const type of ['touch','pen'])for(const spacing of [2,8,16,32]) {
    const engine=createPlayMatcher(letter,refs,getProfile('play',type));
    for(const id of letter.geometry.validSequences[0]) {
      if(refs[id]) {
        const ref=refs[id];engine.start(pointAt(ref,0));
        for(let arc=spacing;arc<ref.length;arc+=spacing)engine.move(pointAt(ref,arc));
        engine.move(pointAt(ref,ref.length));engine.end(pointAt(ref,ref.length));
      } else {const dot=letter.geometry.dotTargets.find(d=>d.id===id);engine.start(dot);engine.end(dot);}
    }
    const s=engine.snapshot();results.push({letter:letter.id,revision:letter.contentVersion,proposal:letter.geometry.status!=='approved',type,spacing,phase:s.phase,coverage:s.metrics.coverage,pauses:s.metrics.pauseEpisodes});
  }
}
const root='output/verification/fix-video-implementation';mkdirSync(root,{recursive:true});
const failures=results.filter(r=>r.phase!=='complete');
const report={date:new Date().toISOString(),catalogueSha256:createHash('sha256').update(source).digest('hex'),checks:results.length,failures,results};
writeFileSync(`${root}/model-audit.json`,JSON.stringify(report,null,2));
writeFileSync(`${root}/review-candidates.json`,JSON.stringify(candidates,null,2));
console.log(JSON.stringify({checks:results.length,currentModels:results.filter(r=>!r.proposal).length,candidates:results.filter(r=>r.proposal).length,failures}));
if(failures.length)process.exitCode=1;
