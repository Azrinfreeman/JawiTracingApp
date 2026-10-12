import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {validateLetter} from '../src/content/validateContent.js';
import {raZaiShortHeadReviewCandidates} from '../src/content/reviewCandidates.js';
const root='output/verification/ra-zai-short-head-approval',read=p=>JSON.parse(readFileSync(p,'utf8')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const before=read(`${root}/before-catalogue.json`),proposals=read(`${root}/reviewed-proposals.json`),letters=read('src/content/letters.json'),reviewed=read('output/verification/ra-zai-short-heads/verification.json');
for(const letter of letters){const proposal=proposals.find(p=>p.candidate.id===letter.id);if(!proposal){assert.deepEqual(letter,before.find(l=>l.id===letter.id));continue;}
 const restored=structuredClone(letter);restored.geometry.status='pendingReview';restored.geometry.review=null;assert.deepEqual(restored,proposal.candidate);
 assert.equal(letter.geometry.status,'approved');assert.deepEqual(letter.geometry.review,{revision:letter.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-11',reference:'docs/CONTENT_APPROVALS.md#approval-of-ra-and-zai-shorter-heads-2026-10-11',kind:'projectOwner'});assert.equal(validateLetter(letter).ready,true);
}
assert.equal(raZaiShortHeadReviewCandidates(letters).length,0);assert.equal(letters.filter(l=>validateLetter(l).ready).length,36);
const audio=read('output/verification/ra-zai-short-heads/before-audio-hashes.json'),actual={};function walk(dir,target){for(const f of readdirSync(dir,{withFileTypes:true})){const p=`${dir}/${f.name}`;if(f.isDirectory())walk(p,target);else target[p]=hash(p);}}walk('public/audio',actual);assert.deepEqual(actual,audio);
for(const [p,h]of Object.entries(reviewed.inputs))if(p.startsWith('src/')&&p!=='src/content/letters.json')assert.equal(hash(p),h,`Unrelated source changed: ${p}`);
const inputs={};walk('src',inputs);for(const p of ['package.json','package-lock.json','vite.config.js','playwright.config.js','tests/browser/ra-zai-short-heads.spec.js','tests/geometry/raZaiShortHeads.test.js','tests/geometry/outlineAppearance.test.js','tests/game/glyphMatched.test.js','tests/fixtures/ra-zai-short-head-originals.json','tests/fixtures/ra-zai-short-head-routes.json','tests/browser/helpers/localTest.js','tests/browser/helpers/navigation.js','tests/browser/helpers/tracing.js','tests/browser/helpers/audio.js','tests/browser/fixtures/outlineMatchHarness.jsx','scripts/verify-ra-zai-short-head-approval.mjs','scripts/promote-ra-zai-short-heads.mjs'])inputs[p]=hash(p);
const report={date:'2026-10-11',reviewer:'Project owner (Codex user; name not supplied)',scope:['Ra 4','Zai 5'],otherEntriesExact:34,sinSyinExact:true,reviewedGeometryExact:true,audioFilesExact:Object.keys(actual).length,readyLessons:36,pendingCandidates:0,inputs,build:readdirSync('dist/assets').filter(p=>p.endsWith('.js')||p.endsWith('.css'))};
writeFileSync(`${root}/integrity.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({otherEntriesExact:34,sinSyinExact:true,reviewedGeometryExact:true,audioFilesExact:report.audioFilesExact,readyLessons:36,pendingCandidates:0}));
