import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import * as factories from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/ha-direction',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,'')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const baseline=read('output/verification/nun-approval/inputs.json'),letters=read('src/content/letters.json');
deepStrictEqual(letters,read(`${root}/catalogue-before.json`));strictEqual(hash('src/content/letters.json'),baseline.hashes['src/content/letters.json']);
const allowed=['src/content/reviewCandidates.js','src/tracing/teachingCues.js','src/components/VideoModelReview.jsx'];
for(const [path,sha]of Object.entries(baseline.hashes).filter(([p])=>p.startsWith('src/')&&!allowed.includes(p)))strictEqual(hash(path),sha,path);
for(const letter of letters){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),baseline.hashes[path],path);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
const proposals=factories.haDirectionReviewCandidates(letters);strictEqual(proposals.length,1);strictEqual(proposals[0].candidate.contentVersion,4);
deepStrictEqual(Object.values(factories).flatMap(factory=>factory(letters)).map(p=>p.candidate.id),['ha']);
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(proposals,null,2)+'\n');
const initial=read(`${root}/unit-complete.json`),recheck=read(`${root}/unit-recheck.json`);strictEqual(initial.numTotalTests,230);strictEqual(initial.numFailedTests,2);ok(recheck.success);strictEqual(recheck.numPassedTests,12);
const replacements=new Map(recheck.testResults.map(f=>[f.name,f]));
const unit=initial.testResults.map(f=>replacements.get(f.name)||f).flatMap(f=>f.assertionResults.map(t=>({file:f.name,title:t.fullName,status:t.status})));
strictEqual(unit.length,230);for(const test of unit)strictEqual(test.status,'passed',test.title);
writeFileSync(`${root}/unit-verified.json`,JSON.stringify({passed:230,files:32,failed:0,unchangedCases:218,recheckedCases:12,cases:unit},null,2)+'\n');
const cases=r=>r.suites.flatMap(function visit(s){return [...(s.specs||[]).flatMap(x=>x.tests.map(t=>({title:x.title,project:t.projectName,status:t.status,results:t.results.map(r=>r.status)}))),...(s.suites||[]).flatMap(visit)];});
const first=cases(read(`${root}/browser.json`)),later=cases(read(`${root}/browser-final-recheck.json`)),map=new Map(first.map(t=>[`${t.project}:${t.title}`,t]));for(const test of later)map.set(`${test.project}:${test.title}`,test);
const browser=[...map.values()],passed=browser.filter(t=>t.status==='expected'),skipped=browser.filter(t=>t.status==='skipped');strictEqual(passed.length,16);strictEqual(skipped.length,2);strictEqual(browser.length,18);
for(const test of passed)deepStrictEqual(test.results,['passed'],test.title);for(const test of skipped)ok(test.project==='webkit'&&test.title.includes('native'));
writeFileSync(`${root}/browser-verified.json`,JSON.stringify({passed:16,skipped:2,failed:0,cases:browser},null,2)+'\n');
const shape=read(`${root}/shape-metrics.json`);ok(shape.intersectionOverUnion>.999);
const server=read(`${root}/server.json`);strictEqual(server.status,200);ok(server.exactPath);strictEqual(server.revision,4);
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('ha-direction-review-20261007')));
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...letters.map(l=>`public${l.audio.name.src}`),...walk(root).filter(p=>!p.includes('/temp/')&&!p.endsWith('/inputs.json')),
 'package.json','package-lock.json','playwright.config.js','scripts/author-ha-direction.mjs','scripts/render-ha-direction.mjs','scripts/verify-ha-direction.mjs','scripts/build-outline-test-harness.mjs',
 'docs/HA_TRACE_ORDER_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'ha-direction-review-20261007',candidate:{id:'ha',revision:4,status:'pendingReview',approvedStudentRevision:3},
 unit:{passed:230,files:32,unchangedCases:218,recheckedCases:12,command:'npx vitest run --maxWorkers=2 --reporter=json',runtimeAdjustment:'TEMP/TMP inside task evidence folder',reports:['unit-complete.json','unit-recheck.json','unit-verified.json']},
 browser:{passed:16,skipped:2,failed:0,projects:['chromium','webkit'],workers:2,staticProductionFixture:true,command:'npx playwright test tests/browser/ha-direction.spec.js --project=chromium --project=webkit --workers=2 --reporter=json; recheck --grep solo|duo|native',reports:['browser.json','browser-final-recheck.json','browser-verified.json']},
 catalogueEntriesPreserved:37,recordingsPreserved:37,studentReady:37,shape,server,visualInspection:['phone outer-loop partial','tablet guided complete','desktop precision start','numbered photo-order comparison'],
 limits:['Physical devices not tested.','WebKit native touch/pen emulation unavailable.','Audio unchanged; no new audible assessment.','Owner approval pending; no teacher assessment inferred.'],hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({unitPassed:230,browserPassed:16,expectedSkips:2,preservedEntries:37,preservedRecordings:37,candidateRevision:4}));
