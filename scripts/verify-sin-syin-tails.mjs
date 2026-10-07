import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,deepStrictEqual,ok} from 'node:assert';
import {sinSyinTailReviewCandidates,videoReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter,validateCatalogue} from '../src/content/validateContent.js';
import {parsePath} from './lib/glyph-geometry.mjs';
const root='output/verification/sin-syin-tails';
const read=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const before=read(`${root}/before-inputs.json`),current=read('src/content/letters.json');
strictEqual(hash('src/content/letters.json'),before.hashes['src/content/letters.json']);
deepStrictEqual(current,read(`${root}/before-catalogue.json`));
const changed=new Set(['src/content/reviewCandidates.js','src/components/VideoModelReview.jsx']);
for(const [path,sha]of Object.entries(before.hashes))if(!changed.has(path))strictEqual(hash(path),sha,path);
const proposals=sinSyinTailReviewCandidates(current);deepStrictEqual(proposals.map(p=>p.candidate.id),['sin','syin']);
for(const {original,candidate}of proposals){
 const old=parsePath(original.geometry.strokes[0].path),updated=parsePath(candidate.geometry.strokes[0].path);
 deepStrictEqual(updated.slice(0,-1),old.slice(0,-1));deepStrictEqual(updated.at(-1).slice(0,-1),old.at(-1).slice(0,-1));
 deepStrictEqual(updated.at(-1).at(-1),{x:185,y:510});strictEqual(old.at(-1).at(-1).y-510,40);
 strictEqual(510-updated[3].at(-1).y,95);strictEqual(candidate.contentVersion,original.contentVersion+1);
 strictEqual(candidate.geometry.status,'pendingReview');strictEqual(candidate.geometry.review,null);
 deepStrictEqual(candidate.geometry.dotTargets,original.geometry.dotTargets);deepStrictEqual(candidate.geometry.validSequences,original.geometry.validSequences);
 deepStrictEqual(candidate.audio,original.audio);deepStrictEqual(validateLetter(candidate),{valid:true,errors:[],ready:false});
}
const validation=validateCatalogue(current);ok(validation.valid);strictEqual(validation.results.filter(letter=>letter.ready).length,37);
strictEqual(videoReviewCandidates(current).length,4);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,202);strictEqual(unit.numFailedTests,0);
const coarse=read(`${root}/coarse-touch-pen-result.json`);strictEqual(coarse.checked,12);deepStrictEqual(coarse.failed,[]);
const initial=read(`${root}/browser-initial.json`),recheck=read(`${root}/browser-recheck.json`);
strictEqual(initial.stats.expected,22);strictEqual(initial.stats.unexpected,12);strictEqual(initial.stats.skipped,0);
strictEqual(recheck.stats.expected,12);strictEqual(recheck.stats.unexpected,0);strictEqual(recheck.stats.skipped,0);
const specs=suite=>[...(suite.specs||[]),...(suite.suites||[]).flatMap(specs)];
const combined=structuredClone(initial),replacements=specs(recheck);
for(const spec of specs(combined)){
 const replacement=replacements.find(item=>item.title===spec.title);
 if(replacement){
  spec.tests=spec.tests.map(test=>{const result=replacements.filter(s=>s.title===spec.title).flatMap(s=>s.tests).find(t=>t.projectName===test.projectName);ok(result);strictEqual(result.status,'expected');return result;});spec.ok=true;
 }else ok(spec.tests.every(test=>test.status==='expected'),spec.title);
}
const statuses=specs(combined).flatMap(spec=>spec.tests.map(test=>test.status));strictEqual(statuses.length,34);ok(statuses.every(status=>status==='expected'));
combined.stats={...initial.stats,expected:34,unexpected:0,flaky:0,skipped:0,duration:initial.stats.duration+recheck.stats.duration};
combined.scopeRecheck={initial:'browser-initial.json',recheck:'browser-recheck.json',originalTest:'browser-test-initial.js',
 affectedSelection:'actual before/after|unscored tail',stablePassedCases:22,correctedPassedCases:12,
 reason:'Initial comparison mixed student and preview banner heights, and unscored preview checks incorrectly expected scored attempt callbacks. Both test expectations corrected; application source unchanged.',
 description:'Combined distinct-case evidence; no second full-suite execution.'};
writeFileSync(`${root}/browser-final.json`,JSON.stringify(combined,null,2)+'\n');
const server=read(`${root}/server.json`);strictEqual(server.candidateStatus,200);strictEqual(server.reviewStatus,200);
strictEqual(server.reviewChoiceServed,true);strictEqual(server.raisedEndServed,true);
const assets=readdirSync('dist/assets').filter(path=>path.endsWith('.js'));ok(assets.some(path=>readFileSync(`dist/assets/${path}`,'utf8').includes('sin-syin-tail-review-20261006')));
for(const letter of current)strictEqual(hash(`dist${letter.audio.name.src}`),hash(`public${letter.audio.name.src}`));
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${folder}/${entry.name}`):[`${folder}/${entry.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...current.map(letter=>`public${letter.audio.name.src}`),
 'package.json','package-lock.json','playwright.config.js','scripts/record-sin-syin-tail-inputs.mjs','scripts/verify-sin-syin-tails.mjs','scripts/build-outline-test-harness.mjs',
 `${root}/before-catalogue.json`,`${root}/before-inputs.json`,`${root}/unit.json`,`${root}/browser-initial.json`,`${root}/browser-recheck.json`,
 `${root}/browser-final.json`,`${root}/browser-test-initial.js`,`${root}/test-harness.js`,`${root}/server.json`,`${root}/coarse-touch-pen-check.txt`,`${root}/coarse-touch-pen-result.json`,
 ...walk(`${root}/browser`),'docs/SIN_SYIN_TAIL_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'sin-syin-tail-review-20261006',
 scope:'Adult-only Sin 2/Syin 3 tail review; left tip raised 40 logical units, remaining 95 below the adjacent head peak.',
 revisions:Object.fromEntries(proposals.map(({candidate})=>[candidate.id,candidate.contentVersion])),geometryApproval:'pendingReview',
 preserved:{catalogueEntries:37,recordings:37,audioMetadata:true,gaAudioVersion:current.find(letter=>letter.id==='ga').audio.name.version,olderVideoProposals:4},
 studentReady:37,unit:{command:'npm test -- --reporter=json --outputFile=output/verification/sin-syin-tails/unit.json',passed:202,failed:0,files:unit.testResults.length},
 coarseInput:{command:coarse.command,script:coarse.script,passed:12,failed:0,profiles:['touch','pen'],spacing:[8,24,40],physicalDevice:false},
 browser:{command:'npx playwright test tests/browser/sin-syin-tails.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',
 productionStaticFixture:true,distinctPassed:34,chromium:17,webkit:17,failed:0,skipped:0,
 recheckCommand:'npx playwright test tests/browser/sin-syin-tails.spec.js --grep "actual before/after|unscored tail" --project=chromium --project=webkit --workers=2 --reporter=line,json',
 ...combined.scopeRecheck},server,
 visualInspection:['Actual before/after board comparison for Sin and Syin','320x600 Syin start with raised finish and clear numbered guides','768x1024 Syin guided completion with every dot'],
 pending:'Owner review of pictured Sin 2/Syin 3 before promotion to normal student lessons. AGENTS.md requires a new revision and fresh review for changed geometry.',
 limits:['No professional teacher assessment inferred.','Physical-device touch/pen and new APK are not part of this scope.'],
 hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({previewRevisions:report.revisions,unitPassed:202,browserPassed:34,coarseInputPassed:12,preservedCatalogue:37,preservedRecordings:37,studentReady:37,approval:'pendingReview'}));
