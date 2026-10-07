import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import * as factories from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/ha-approval',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,'')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const reviewed=read('output/verification/ha-direction/inputs.json'),before=read(`${root}/before-catalogue.json`),letters=read('src/content/letters.json'),proposals=read(`${root}/reviewed-proposals.json`);
strictEqual(hash(`${root}/before-catalogue.json`),reviewed.hashes['src/content/letters.json']);deepStrictEqual(proposals,read('output/verification/ha-direction/reviewed-proposals.json'));
deepStrictEqual(proposals,factories.haDirectionReviewCandidates(before));deepStrictEqual(read('tests/fixtures/ha-direction-original.json'),proposals[0].original);
const approved=structuredClone(proposals[0].candidate);approved.geometry.status='approved';approved.geometry.review={revision:4,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-ha-photo-order-2026-10-07',kind:'projectOwner'};
deepStrictEqual(letters,before.map(l=>l.id==='ha'?approved:l));
for(const [path,sha]of Object.entries(reviewed.hashes).filter(([p])=>p.startsWith('src/')&&p!=='src/content/letters.json'))strictEqual(hash(path),sha,path);
for(const letter of letters){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),reviewed.hashes[path],path);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
for(const factory of Object.values(factories))deepStrictEqual(factory(letters),[]);
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,232);strictEqual(unit.numFailedTests,0);strictEqual(unit.testResults.length,33);
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,16);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,2);
const cases=browser.suites.flatMap(function visit(s){return [...(s.specs||[]).flatMap(x=>x.tests.map(t=>({title:x.title,project:t.projectName,status:t.status,results:t.results.map(r=>r.status)}))),...(s.suites||[]).flatMap(visit)];});
for(const test of cases){if(test.status==='skipped')ok(test.project==='webkit'&&test.title.includes('native'));else {strictEqual(test.status,'expected');deepStrictEqual(test.results,['passed']);}}
const server=read(`${root}/server.json`);strictEqual(server.status,200);ok(server.exactCatalogue);strictEqual(server.geometryRevision,4);strictEqual(server.geometryStatus,'approved');strictEqual(server.audioRevision,1);
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('ha-photo-order-approved-20261007')));
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...letters.map(l=>`public${l.audio.name.src}`),...walk(root).filter(p=>!p.includes('/temp/')&&!p.endsWith('/inputs.json')),
 'package.json','package-lock.json','playwright.config.js','scripts/promote-ha-direction.mjs','scripts/verify-ha-approval.mjs','scripts/build-outline-test-harness.mjs',
 'docs/HA_TRACE_ORDER_APPROVAL.md','docs/CONTENT_APPROVALS.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'ha-photo-order-approved-20261007',approval:read(`${root}/authorisation.json`),
 exactReviewedModel:true,otherEntriesPreserved:36,recordingsPreserved:37,allAudioMetadataPreserved:true,ready:37,proposals:0,
 unit:{passed:232,files:33,command:'npx vitest run --maxWorkers=2 --reporter=json --outputFile=output/verification/ha-approval/unit.json',runtime:'TEMP/TMP inside task evidence folder'},
 browser:{passed:16,expectedSkips:2,failed:0,flaky:0,command:'npx playwright test tests/browser/ha-direction.spec.js --project=chromium --project=webkit --workers=2 --reporter=json',staticProductionFixture:true,cases},server,
 visualInspection:['student phone outer-loop partial','student tablet guided completion','student desktop precision start'],
 limits:['Physical devices not tested.','Audio unchanged by Ha approval.','No teacher assessment inferred.','Va audio correction awaits identification of supplied reference.'],hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({approvedHa:4,unitPassed:232,browserPassed:16,expectedSkips:2,preservedOtherEntries:36,preservedAudio:37,ready:37}));
