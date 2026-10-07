import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,deepStrictEqual,ok} from 'node:assert';
import * as reviews from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';

const root='output/verification/nun-approval',read=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const reviewed=read('output/verification/nun-outline/inputs.json'),before=read(`${root}/before-catalogue.json`),letters=read('src/content/letters.json');
strictEqual(hash(`${root}/before-catalogue.json`),reviewed.hashes['src/content/letters.json']);
for(const [path,sha]of Object.entries(reviewed.hashes).filter(([path])=>path.startsWith('src/')&&path!=='src/content/letters.json'))strictEqual(hash(path),sha,path);
const proposals=read(`${root}/reviewed-proposals.json`);deepStrictEqual(proposals,reviews.fourLetterReviewCandidates(before));
deepStrictEqual(proposals,read('output/verification/nun-outline/reviewed-proposals.json'));deepStrictEqual(proposals.map(proposal=>[proposal.candidate.id,proposal.candidate.contentVersion]),[['nun',3]]);
deepStrictEqual(read('tests/fixtures/nun-outline-original.json'),proposals[0].original);
const expected=before.map(original=>{
 if(original.id!=='nun')return original;
 const approved=structuredClone(proposals[0].candidate);approved.geometry.status='approved';
 approved.geometry.review={revision:3,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-nun-catalogue-outline-2026-10-07',kind:'projectOwner'};
 return approved;
});deepStrictEqual(letters,expected);
deepStrictEqual(letters.map(letter=>letter.audio),before.map(letter=>letter.audio));
for(const letter of letters){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),reviewed.hashes[path]);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
for(const factory of Object.values(reviews))deepStrictEqual(factory(letters),[]);
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(letter=>letter.ready).length,37);
const initial=read(`${root}/unit.json`),recheck=read(`${root}/unit-recheck.json`);
strictEqual(initial.numTotalTests,224);strictEqual(initial.numFailedTests,1);strictEqual(initial.testResults.length,31);ok(recheck.success);strictEqual(recheck.numPassedTests,7);strictEqual(recheck.testResults.length,1);
const replacement=recheck.testResults[0];ok(initial.testResults.some(file=>file.name===replacement.name));
const cases=initial.testResults.map(file=>file.name===replacement.name?replacement:file).flatMap(file=>file.assertionResults.map(test=>({file:file.name,title:test.fullName,status:test.status})));
strictEqual(cases.length,224);for(const test of cases)strictEqual(test.status,'passed',test.title);
writeFileSync(`${root}/unit-final.json`,JSON.stringify({description:'217 unchanged initial cases plus 7 cases from the repaired historical glyph test file.',passed:224,files:31,failed:0,cases},null,2)+'\n');
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,18);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
const browserCases=browser.suites.flatMap(function visit(suite){return [...(suite.specs||[]).flatMap(spec=>spec.tests.map(test=>({project:test.projectName,title:spec.title,status:test.status,results:test.results.map(result=>result.status)}))),...(suite.suites||[]).flatMap(visit)];});
strictEqual(browserCases.length,18);for(const project of ['chromium','webkit'])strictEqual(browserCases.filter(test=>test.project===project).length,9);
for(const test of browserCases){strictEqual(test.status,'expected',test.title);deepStrictEqual(test.results,['passed'],test.title);}
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.exactCatalogue,true);strictEqual(server.geometryRevision,3);strictEqual(server.geometryStatus,'approved');strictEqual(server.audioRevision,2);strictEqual(server.appearance,'catalogueOutline');
ok(readdirSync('dist/assets').filter(path=>path.endsWith('.js')).some(path=>readFileSync(`dist/assets/${path}`,'utf8').includes('nun-outline-approved-20261007')));
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${folder}/${entry.name}`):[`${folder}/${entry.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...letters.map(letter=>`public${letter.audio.name.src}`),
 'package.json','package-lock.json','playwright.config.js','scripts/verify-nun-approval.mjs','scripts/build-outline-test-harness.mjs',
 ...walk(root).filter(path=>!path.endsWith('/inputs.json')),
 'docs/NUN_TRACE_APPEARANCE_APPROVAL.md','docs/CONTENT_APPROVALS.md','docs/CONTENT_REVIEW.md','docs/PROJECT_STATE.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'nun-outline-approved-20261007',
 approval:{quote:'approve',question:'Approve Nun 3 for the normal game?',reviewer:'Project owner (Codex user; name not supplied)',revisions:{nun:3}},
 exactReviewedModelPreserved:true,unrelatedEntriesPreserved:36,allAudioMetadataPreserved:true,recordingsPreserved:37,studentReady:37,currentProposals:0,
 unit:{initialCommand:'npm test -- --reporter=json --outputFile=output/verification/nun-approval/unit.json',recheckCommand:'npx vitest run tests/game/glyphMatched.test.js --reporter=json --outputFile=output/verification/nun-approval/unit-recheck.json',passed:224,files:31,unchangedCases:217,recheckedCases:7,failed:0},
 browser:{command:'npx playwright test tests/browser/nun-outline.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:18,chromium:9,webkit:9,failed:0,flaky:0,skipped:0,productionStaticFixture:true},
 server,visualInspection:['Chromium phone play start/completed outline','WebKit tablet guided completed reference/ink','Chromium desktop fit','Chromium phone empty review scopes'],
 limits:['Physical-device touch and pen not tested.','Audio unchanged; native audible playback not newly verified.','No teacher assessment inferred.','No APK, deployment or publication requested.'],
 hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({approvedRevision:3,unitPassed:224,browserPassed:18,preservedOtherEntries:36,preservedRecordings:37,studentReady:37,currentProposals:0}));
