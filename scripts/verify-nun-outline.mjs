import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,deepStrictEqual,ok} from 'node:assert';
import * as reviews from '../src/content/reviewCandidates.js';
import {validateCatalogue,validateLetter} from '../src/content/validateContent.js';

const root='output/verification/nun-outline',read=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const previous=read('output/verification/nga-audio/inputs.json'),letters=read('src/content/letters.json');
strictEqual(hash('src/content/letters.json'),previous.hashes['src/content/letters.json']);
strictEqual(hash(`${root}/before-catalogue.json`),hash('src/content/letters.json'));
for(const [path,sha]of Object.entries(previous.hashes).filter(([path])=>path.startsWith('src/')&&path!=='src/content/reviewCandidates.js'))strictEqual(hash(path),sha,path);
const proposals=reviews.fourLetterReviewCandidates(letters);deepStrictEqual(proposals.map(proposal=>[proposal.candidate.id,proposal.candidate.contentVersion]),[['nun',3]]);
const [{original,candidate}]=proposals;strictEqual(candidate.geometry.status,'pendingReview');strictEqual(candidate.geometry.review,null);
deepStrictEqual(candidate.geometry.appearance,read('src/content/nunOutline.json').nun);
const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;delete restored.geometry.appearance;deepStrictEqual(restored,original);
deepStrictEqual(validateLetter(candidate),{valid:true,errors:[],ready:false});
for(const [name,factory]of Object.entries(reviews))if(name!=='fourLetterReviewCandidates')deepStrictEqual(factory(letters),[]);
for(const letter of letters){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),previous.hashes[path]);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(letter=>letter.ready).length,37);
const [metrics]=read(`${root}/appearance-metrics.json`);strictEqual(metrics.id,'nun');strictEqual(metrics.revision,3);ok(metrics.outlineInkOverlap>.99);ok(metrics.revealPieceOverlap>.99);
strictEqual(metrics.sourceSha256,hash(`node_modules/${candidate.geometry.appearance.source.font}`));
const initial=read(`${root}/unit.json`),recheck=read(`${root}/unit-recheck.json`);strictEqual(initial.numTotalTests,222);strictEqual(initial.numFailedTests,1);strictEqual(initial.testResults.length,30);
ok(recheck.success);strictEqual(recheck.numPassedTests,2);strictEqual(recheck.testResults.length,1);
const replacement=recheck.testResults[0];ok(initial.testResults.some(file=>file.name===replacement.name));
const finalFiles=initial.testResults.map(file=>file.name===replacement.name?replacement:file),unitCases=finalFiles.flatMap(file=>file.assertionResults.map(test=>({file:file.name,title:test.fullName,status:test.status})));
strictEqual(unitCases.length,222);for(const test of unitCases)strictEqual(test.status,'passed',test.title);
writeFileSync(`${root}/unit-final.json`,JSON.stringify({description:'220 unchanged initial cases plus 2 cases from the repaired historical approval file.',passed:222,files:30,failed:0,cases:unitCases},null,2)+'\n');
const browser=read(`${root}/browser-initial.json`),browserRecheck=read(`${root}/browser-recheck.json`);
const cases=report=>report.suites.flatMap(function visit(suite){return [...(suite.specs||[]).flatMap(spec=>spec.tests.map(test=>({key:`${test.projectName}: ${spec.title}`,project:test.projectName,title:spec.title,status:test.status,results:test.results.map(result=>result.status)}))),...(suite.suites||[]).flatMap(visit)];});
const initialCases=cases(browser),recheckedCases=cases(browserRecheck),changed=test=>test.title.includes('unscored independent');
strictEqual(initialCases.length,18);strictEqual(recheckedCases.length,4);
deepStrictEqual(recheckedCases.map(test=>test.key).sort(),initialCases.filter(changed).map(test=>test.key).sort());
const finalCases=[...initialCases.filter(test=>!changed(test)),...recheckedCases];strictEqual(finalCases.length,18);
for(const test of finalCases){strictEqual(test.status,'expected',test.key);deepStrictEqual(test.results,['passed'],test.key);}
for(const project of ['chromium','webkit'])strictEqual(finalCases.filter(test=>test.project===project).length,9);
strictEqual(browserRecheck.stats.unexpected,0);strictEqual(browserRecheck.stats.flaky,0);strictEqual(browserRecheck.stats.skipped,0);
writeFileSync(`${root}/browser-final.json`,JSON.stringify({description:'14 unchanged initial cases plus 4 repaired unscored preview cases. No application changes during repair.',passed:18,failed:0,skipped:0,cases:finalCases},null,2)+'\n');
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.exactProposal,true);strictEqual(server.baseRevision,2);strictEqual(server.proposalRevision,3);
ok(readdirSync('dist/assets').filter(path=>path.endsWith('.js')).some(path=>readFileSync(`dist/assets/${path}`,'utf8').includes('nun-outline-review-20261007')));
writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(proposals,null,2)+'\n');
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${folder}/${entry.name}`):[`${folder}/${entry.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...letters.map(letter=>`public${letter.audio.name.src}`),
 'package.json','package-lock.json','playwright.config.js','scripts/author-nun-outline.mjs','scripts/measure-nun-outline.mjs','scripts/verify-nun-outline.mjs',
 'scripts/lib/glyph-geometry.mjs','scripts/lib/outline-contours.mjs','scripts/glyph-trace-plan.json','scripts/build-outline-test-harness.mjs',
 `node_modules/${candidate.geometry.appearance.source.font}`,...walk(root).filter(path=>!path.endsWith('/inputs.json')),
 'docs/NUN_TRACE_APPEARANCE_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'nun-outline-review-20261007',
 scope:'Nun 3 adult preview: exact catalogue-font body and dot contours; routes, order, targets and audio retained.',approval:'pendingReview',revisions:{nun:3},
 preservedCatalogue:37,preservedRecordings:37,studentReady:37,currentProposals:1,metrics,
 unit:{initialCommand:'npm test -- --reporter=json --outputFile=output/verification/nun-outline/unit.json',recheckCommand:'npx vitest run tests/geometry/videoReviewApproval.test.js --reporter=json --outputFile=output/verification/nun-outline/unit-recheck.json',passed:222,files:30,unchangedCases:220,recheckedCases:2,failed:0},
 browser:{initialCommand:'npx playwright test tests/browser/nun-outline.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',recheckCommand:"same file/projects with --grep 'unscored independent'",passed:18,chromium:9,webkit:9,unchangedCases:14,recheckedCases:4,failed:0,skipped:0,productionStaticFixture:true},
 server,visualInspection:['Catalogue-font/Nun3 comparison','Chromium 320x600 play start','Chromium 768x1024 completed reference/ink','WebKit 320x600 final diamond-dot stage'],
 pending:'Owner approval of Nun 3 before student promotion',limits:['Physical-device touch and pen untested','Audio unchanged; no new native playback checks','No teacher assessment inferred','No APK, deployment or publication requested'],
 hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({proposal:3,approval:'pendingReview',unitPassed:222,browserPassed:18,preservedCatalogue:37,preservedRecordings:37,studentReady:37}));
