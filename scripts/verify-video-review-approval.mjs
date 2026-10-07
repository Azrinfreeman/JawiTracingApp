import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import * as reviews from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/video-review-approval';
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const reviewed=read('output/verification/mim-head-gap/inputs.json');
const before=read(`${root}/before-catalogue.json`),proposals=read(`${root}/reviewed-proposals.json`),current=read('src/content/letters.json');
strictEqual(hash(`${root}/before-catalogue.json`),reviewed.hashes['src/content/letters.json']);
for(const [path,sha]of Object.entries(reviewed.hashes).filter(([path])=>path.startsWith('src/')&&path!=='src/content/letters.json'))strictEqual(hash(path),sha,path);
deepStrictEqual(proposals,reviews.videoReviewCandidates(before));
deepStrictEqual(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion]),[['mim',5],['ta-marbuta',4],['hamzah',4],['jim',4]]);
const scopeNames=Object.keys(reviews).filter(name=>name.endsWith('ReviewCandidates'));
const inventory=Object.fromEntries(scopeNames.map(name=>[name,reviews[name](before).map(p=>({id:p.candidate.id,revision:p.candidate.contentVersion}))]));
deepStrictEqual(read(`${root}/scope-inventory.json`),inventory);
const expected=before.map(original=>{
 const proposal=proposals.find(p=>p.candidate.id===original.id);if(!proposal)return original;
 const approved=structuredClone(proposal.candidate);approved.geometry.status='approved';
 approved.geometry.review={revision:approved.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-06',
  reference:'docs/CONTENT_APPROVALS.md#approval-of-all-current-semakan-video-proposals-2026-10-06',kind:'projectOwner'};
 return approved;
});
deepStrictEqual(current,expected);
for(const name of scopeNames)deepStrictEqual(reviews[name](current),[]);
deepStrictEqual(current.map(l=>l.audio),before.map(l=>l.audio));
for(const letter of current){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),reviewed.hashes[path]);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
const validation=validateCatalogue(current);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,208);strictEqual(unit.numFailedTests,0);
const initial=read(`${root}/browser-initial.json`),recheck=read(`${root}/browser-review-recheck.json`);
const cases=report=>report.suites.flatMap(function visit(suite){return [...(suite.specs||[]).flatMap(spec=>spec.tests.map(test=>({key:`${test.projectName}: ${spec.title}`,title:spec.title,status:test.status,results:test.results.map(r=>r.status)}))),...(suite.suites||[]).flatMap(visit)];});
const originalCases=cases(initial),recheckedCases=cases(recheck),reviewCase=c=>c.title.includes('all matching approvals');
strictEqual(originalCases.length,52);strictEqual(recheckedCases.length,4);
deepStrictEqual(recheckedCases.map(c=>c.key).sort(),originalCases.filter(reviewCase).map(c=>c.key).sort());
const distinctCases=[...originalCases.filter(c=>!reviewCase(c)),...recheckedCases];
strictEqual(distinctCases.length,52);for(const c of distinctCases){strictEqual(c.status,'expected',c.key);deepStrictEqual(c.results,['passed'],c.key);}
strictEqual(recheck.stats.unexpected,0);strictEqual(recheck.stats.skipped,0);strictEqual(recheck.stats.flaky,0);
writeFileSync(`${root}/browser-final.json`,JSON.stringify({description:'Combined distinct-case evidence: 48 unchanged initial cases plus 4 repaired review-screen cases; not a second full-suite run.',initial:'browser-initial.json',recheck:'browser-review-recheck.json',passed:52,failed:0,skipped:0,cases:distinctCases},null,2)+'\n');
const server=read(`${root}/server.json`);strictEqual(server.status,200);deepStrictEqual(server.revisions,{mim:5,'ta-marbuta':4,hamzah:4,jim:4});strictEqual(server.exactCatalogue,true);
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('video-review-approved-20261006')));
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${folder}/${e.name}`):[`${folder}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...current.map(l=>`public${l.audio.name.src}`),
 'package.json','package-lock.json','playwright.config.js','scripts/verify-video-review-approval.mjs',
 `${root}/before-catalogue.json`,`${root}/reviewed-proposals.json`,`${root}/scope-inventory.json`,`${root}/test-harness.js`,
 `${root}/unit.json`,`${root}/browser-initial.json`,`${root}/browser-review-recheck.json`,`${root}/browser-final.json`,`${root}/server.json`,...walk(`${root}/browser`),
 'docs/VIDEO_REVIEW_APPROVAL.md','docs/CONTENT_APPROVALS.md','docs/CONTENT_REVIEW.md','docs/PROJECT_STATE.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'video-review-approved-20261006',
 approval:{quote:'approve all tthe alphabets in semakan video',reviewer:'Project owner (Codex user; name not supplied)',revisions:{mim:5,'ta-marbuta':4,hamzah:4,jim:4}},
 exactReviewedModelsAndRenderersPreserved:true,unrelatedEntriesPreserved:33,allAudioMetadataPreserved:true,recordingsPreserved:37,gaAudioVersion:7,
 currentReviewProposals:0,reviewScopes:scopeNames,studentReady:37,
 unit:{command:'npm test -- --reporter=json --outputFile=output/verification/video-review-approval/unit.json',passed:208,files:unit.testResults.length,failed:0},
 browser:{command:'npx playwright test tests/browser/video-review-approval.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',recheckCommand:'same file/projects with --grep "all matching approvals"',passed:52,chromium:26,webkit:26,failed:0,skipped:0,stableInitialPassed:48,recheckedPassed:4,reason:'Review-screen test now waits for the measured grid after paging; no application changes during repair.',productionStaticFixture:true},
 server,visualInspection:['All four Chromium 768x1024 guided starts','WebKit Mim 320x600 play start','Chromium Jim 320x600 play start','Chromium 320x600 empty review scopes'],
 limits:['Physical-device touch and pen were not tested.','Controlled audio instrumentation; native audible playback was not newly verified.','No APK, deployment or publication requested.'],
 hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({approved:report.approval.revisions,studentReady:37,unitPassed:208,browserPassed:52,currentProposals:0,preservedOtherEntries:33,preservedRecordings:37}));
