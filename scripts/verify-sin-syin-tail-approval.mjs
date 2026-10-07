import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {sinSyinTailReviewCandidates,videoReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/sin-syin-tail-approval';
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const reviewed=read('output/verification/sin-syin-tails/inputs.json'),before=read(`${root}/before-catalogue.json`);
const current=read('src/content/letters.json');
strictEqual(hash(`${root}/before-catalogue.json`),reviewed.hashes['src/content/letters.json']);
for(const [path,sha]of Object.entries(reviewed.hashes).filter(([path])=>path.startsWith('src/')&&path!=='src/content/letters.json'))strictEqual(hash(path),sha,path);
const proposals=sinSyinTailReviewCandidates(before);deepStrictEqual(proposals.map(p=>p.candidate.id),['sin','syin']);
const expected=before.map(original=>{
 const proposal=proposals.find(p=>p.candidate.id===original.id);if(!proposal)return original;
 const approved=structuredClone(proposal.candidate);approved.geometry.status='approved';
 approved.geometry.review={revision:approved.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-06',
  reference:'docs/CONTENT_APPROVALS.md#approval-of-sin-and-syin-tails-2026-10-06',kind:'projectOwner'};
 return approved;
});deepStrictEqual(current,expected);deepStrictEqual(sinSyinTailReviewCandidates(current),[]);
deepStrictEqual(videoReviewCandidates(current),videoReviewCandidates(before));strictEqual(videoReviewCandidates(current).length,4);
deepStrictEqual(current.map(l=>l.audio),before.map(l=>l.audio));
for(const letter of current){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),reviewed.hashes[path]);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
const validation=validateCatalogue(current);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,203);strictEqual(unit.numFailedTests,0);
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,32);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
const server=read(`${root}/server.json`);strictEqual(server.status,200);deepStrictEqual(server.revisions,{sin:2,syin:3});strictEqual(server.exactCatalogue,true);
const assets=readdirSync('dist/assets').filter(p=>p.endsWith('.js'));ok(assets.some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('sin-syin-tail-approved-20261006')));
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${folder}/${e.name}`):[`${folder}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...current.map(l=>`public${l.audio.name.src}`),
 'package.json','package-lock.json','playwright.config.js','scripts/verify-sin-syin-tail-approval.mjs',`${root}/before-catalogue.json`,`${root}/review-browser-test.js`,`${root}/test-harness.js`,
 `${root}/unit.json`,`${root}/browser.json`,`${root}/server.json`,...walk(`${root}/browser`),
 'docs/SIN_SYIN_TAIL_APPROVAL.md','docs/CONTENT_APPROVALS.md','docs/CONTENT_REVIEW.md','docs/PROJECT_STATE.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'sin-syin-tail-approved-20261006',
 approval:{quote:'approved',question:'Approve these pictured shapes for the normal game?',reviewer:'Project owner (Codex user; name not supplied)',revisions:{sin:2,syin:3}},
 exactReviewedModelsAndRenderersPreserved:true,unrelatedEntriesPreserved:35,allAudioMetadataPreserved:true,recordingsPreserved:37,gaAudioVersion:7,remainingVideoProposals:4,studentReady:37,
 unit:{command:'npm test -- --reporter=json --outputFile=output/verification/sin-syin-tail-approval/unit.json',passed:203,files:unit.testResults.length,failed:0},
 browser:{command:'npx playwright test tests/browser/sin-syin-tails.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:32,chromium:16,webkit:16,failed:0,skipped:0,productionStaticFixture:true},
 server,visualInspection:['Chromium Sin and Syin 320x600 student starts','WebKit Syin 1280x800 approved desktop guides'],
 limits:['Physical-device touch and pen were not tested.','No APK, deployment or publication requested.'],hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({approved:report.approval.revisions,studentReady:37,unitPassed:203,browserPassed:32,preservedOtherEntries:35,preservedRecordings:37}));
