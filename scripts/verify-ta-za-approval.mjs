import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import * as reviews from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';

const root='output/verification/ta-za-approval';
const read=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const reviewed=read('output/verification/ta-za-original-curve/inputs.json');
const before=read(`${root}/before-catalogue.json`),proposals=read(`${root}/reviewed-proposals.json`),current=read('src/content/letters.json');
strictEqual(hash(`${root}/before-catalogue.json`),reviewed.hashes['src/content/letters.json']);
for(const [path,sha]of Object.entries(reviewed.hashes).filter(([path])=>path.startsWith('src/')&&path!=='src/content/letters.json'))strictEqual(hash(path),sha,path);
deepStrictEqual(proposals,reviews.taZaStemReviewCandidates(before));
deepStrictEqual(proposals,read('output/verification/ta-za-original-curve/reviewed-proposals.json'));
deepStrictEqual(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion]),[['tho',6],['za',6]]);
deepStrictEqual(read('tests/fixtures/ta-za-originals.json'),proposals.map(p=>p.original));
const scopeNames=Object.keys(reviews).filter(name=>name.endsWith('ReviewCandidates'));
strictEqual(scopeNames.length,6);
const inventory=Object.fromEntries(scopeNames.map(name=>[name,reviews[name](before).map(p=>({id:p.candidate.id,revision:p.candidate.contentVersion}))]));
deepStrictEqual(read(`${root}/scope-inventory.json`),inventory);
for(const name of scopeNames)deepStrictEqual(inventory[name],name==='taZaStemReviewCandidates'?[{id:'tho',revision:6},{id:'za',revision:6}]:[]);
const expected=before.map(original=>{
 const proposal=proposals.find(p=>p.candidate.id===original.id);if(!proposal)return original;
 const approved=structuredClone(proposal.candidate);approved.geometry.status='approved';
 approved.geometry.review={revision:6,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',
  reference:'docs/CONTENT_APPROVALS.md#approval-of-ta-and-za-original-curves-2026-10-07',kind:'projectOwner'};
 return approved;
});
deepStrictEqual(current,expected);
for(const name of scopeNames)deepStrictEqual(reviews[name](current),[]);
deepStrictEqual(current.map(letter=>letter.audio),before.map(letter=>letter.audio));
for(const letter of current){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),reviewed.hashes[path]);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
const validation=validateCatalogue(current);ok(validation.valid);strictEqual(validation.results.filter(letter=>letter.ready).length,37);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,215);strictEqual(unit.numFailedTests,0);strictEqual(unit.testResults.length,28);
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,28);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
const cases=browser.suites.flatMap(function visit(suite){return [...(suite.specs||[]).flatMap(spec=>spec.tests.map(test=>({project:test.projectName,title:spec.title,status:test.status,results:test.results.map(result=>result.status)}))),...(suite.suites||[]).flatMap(visit)];});
strictEqual(cases.length,28);for(const project of ['chromium','webkit'])strictEqual(cases.filter(test=>test.project===project).length,14);
for(const test of cases){strictEqual(test.status,'expected',test.title);deepStrictEqual(test.results,['passed'],test.title);}
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.exactCatalogue,true);deepStrictEqual(server.revisions,{tho:6,za:6});
ok(readdirSync('dist/assets').filter(path=>path.endsWith('.js')).some(path=>readFileSync(`dist/assets/${path}`,'utf8').includes('ta-za-approved-20261007')));
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${folder}/${entry.name}`):[`${folder}/${entry.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...current.map(letter=>`public${letter.audio.name.src}`),
 'package.json','package-lock.json','playwright.config.js','scripts/verify-ta-za-approval.mjs','scripts/build-outline-test-harness.mjs',
 `${root}/before-catalogue.json`,`${root}/reviewed-proposals.json`,`${root}/scope-inventory.json`,`${root}/review-browser-test.js`,`${root}/test-harness.js`,
 `${root}/unit.json`,`${root}/browser.json`,`${root}/server.json`,...walk(`${root}/browser`),
 'docs/TA_ZA_APPROVAL.md','docs/CONTENT_APPROVALS.md','docs/CONTENT_REVIEW.md','docs/PROJECT_STATE.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'ta-za-approved-20261007',
 approval:{quote:'proceed',question:'Approve Ta 6 and Za 6 for the normal game?',reviewer:'Project owner (Codex user; name not supplied)',revisions:{tho:6,za:6}},
 exactReviewedModelsPreserved:true,unrelatedEntriesPreserved:35,allAudioMetadataPreserved:true,recordingsPreserved:37,gaAudioVersion:7,
 currentReviewProposals:0,reviewScopes:scopeNames,studentReady:37,
 unit:{command:'npm test -- --reporter=json --outputFile=output/verification/ta-za-approval/unit.json',passed:215,files:28,failed:0},
 browser:{command:'npx playwright test tests/browser/ta-za-stems.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:28,chromium:14,webkit:14,failed:0,flaky:0,skipped:0,productionStaticFixture:true},
 server,visualInspection:['Chromium Ta/Za 768x1024 guided completed letters','WebKit Ta/Za 320x600 play stem guides','Chromium 320x600 empty review scopes'],
 limits:['Physical-device touch and pen were not tested.','Audio is unchanged; controlled instrumentation does not newly verify native audible playback.','No APK, deployment or publication requested.'],
 hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({approved:report.approval.revisions,studentReady:37,unitPassed:215,browserPassed:28,currentProposals:0,preservedOtherEntries:35,preservedRecordings:37}));
