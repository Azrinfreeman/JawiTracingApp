import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {validateLetter} from '../src/content/validateContent.js';
import * as factories from '../src/content/reviewCandidates.js';
const root='output/verification/wau-va-smaller-head-approval',read=p=>JSON.parse(readFileSync(p,'utf8')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const before=read(`${root}/before-catalogue.json`),proposals=read(`${root}/reviewed-proposals.json`),letters=read('src/content/letters.json'),reviewed=read('output/verification/wau-va-smaller-heads/verification.json');
for(const letter of letters){const proposal=proposals.find(p=>p.candidate.id===letter.id);if(!proposal){assert.deepEqual(letter,before.find(l=>l.id===letter.id));continue;}
 const restored=structuredClone(letter);restored.geometry.status='pendingReview';restored.geometry.review=null;assert.deepEqual(restored,proposal.candidate);
 assert.equal(letter.geometry.status,'approved');assert.deepEqual(letter.geometry.review,{revision:letter.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-12',reference:'docs/CONTENT_APPROVALS.md#approval-of-wau-and-va-smaller-heads-2026-10-12',kind:'projectOwner'});assert.equal(validateLetter(letter).ready,true);
}
const remaining=Object.fromEntries(Object.entries(factories).map(([name,factory])=>[name,factory(letters).length]));assert.ok(Object.values(remaining).every(count=>count===0));assert.equal(letters.filter(l=>validateLetter(l).ready).length,36);
const audio=Object.fromEntries(Object.entries(reviewed.inputs).filter(([p])=>p.startsWith('public/audio/'))),actual={};
function walk(dir,target){for(const f of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${f.name}`;if(f.isDirectory())walk(p,target);else target[p]=hash(p);}}
walk('public/audio',actual);assert.deepEqual(actual,audio);
for(const[p,h]of Object.entries(reviewed.inputs))if(p.startsWith('src/')&&p!=='src/content/letters.json')assert.equal(hash(p),h,`Unrelated source changed: ${p}`);
const inputs={};for(const dir of ['src','tests','public','scripts'])walk(dir,inputs);
for(const p of ['package.json','package-lock.json','vite.config.js','playwright.config.js'])inputs[p]=hash(p);
const build={};for(const p of ['dist/index.html',...readdirSync('dist/assets').filter(p=>p.endsWith('.js')||p.endsWith('.css')).map(p=>`dist/assets/${p}`)])build[p]=hash(p);
const report={date:'2026-10-12',reviewer:'Project owner (Codex user; name not supplied)',authorization:'proceed, directly answering Approve Wau 4 / Va 5 for student lessons after the exact pictured comparison and verification',scope:['Wau 4','Va 5'],otherEntriesExact:34,reviewedGeometryExact:true,audioFilesExact:Object.keys(actual).length,readyLessons:36,pendingCandidates:remaining,inputs,build};
writeFileSync(`${root}/integrity.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({otherEntriesExact:34,reviewedGeometryExact:true,audioFilesExact:report.audioFilesExact,readyLessons:36,pendingCandidates:0}));
