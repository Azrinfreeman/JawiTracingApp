import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import * as factories from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/nya-approval',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const reviewed=read('output/verification/nya-tip/inputs.json'),before=read(`${root}/before-catalogue.json`),letters=read('src/content/letters.json'),proposals=read(`${root}/reviewed-proposals.json`);
strictEqual(hash(`${root}/before-catalogue.json`),reviewed.hashes['src/content/letters.json']);deepStrictEqual(proposals,read('output/verification/nya-tip/reviewed-proposals.json'));
deepStrictEqual(proposals,factories.nyaTipReviewCandidates(before));deepStrictEqual(read('tests/fixtures/nya-tip-original.json'),proposals[0].original);
const approved=structuredClone(proposals[0].candidate);approved.geometry.status='approved';approved.geometry.review={revision:4,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-nya-shorter-tip-2026-10-07',kind:'projectOwner'};
deepStrictEqual(letters,before.map(l=>l.id==='nya'?approved:l));
for(const [path,sha]of Object.entries(reviewed.hashes).filter(([p])=>p.startsWith('src/')&&p!=='src/content/letters.json'))strictEqual(hash(path),sha,path);
for(const [src,sha]of Object.entries(read('output/verification/hamzah-ye/audio-before.json'))){strictEqual(hash('public'+src),sha,src);strictEqual(hash('dist'+src),sha,src);}
for(const factory of Object.values(factories))deepStrictEqual(factory(letters),[]);
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,36);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,243);strictEqual(unit.numFailedTests,0);strictEqual(unit.testResults.length,37);
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,18);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
const cases=browser.suites.flatMap(function visit(s){return [...(s.specs||[]).flatMap(x=>x.tests.map(t=>({title:x.title,project:t.projectName,status:t.status,results:t.results.map(r=>r.status)}))),...(s.suites||[]).flatMap(visit)];});
for(const test of cases){strictEqual(test.status,'expected');deepStrictEqual(test.results,['passed']);}
deepStrictEqual(read(`${root}/live-catalogue.json`),letters);ok(readFileSync(`${root}/live-index.html`,'utf8').includes('/@vite/client'));
const build='nya-shorter-tip-approved-20261007';ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes(build)));
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...Object.keys(read('output/verification/hamzah-ye/audio-before.json')).map(p=>'public'+p),
 ...walk(root).filter(p=>!p.includes('/temp/')&&!p.endsWith('/inputs.json')),
 'package.json','package-lock.json','playwright.config.js','scripts/promote-nya-tip.mjs','scripts/verify-nya-approval.mjs','scripts/prepare-nya-approval-browser.mjs','scripts/build-outline-test-harness.mjs',
 'docs/NYA_TIP_APPROVAL.md','docs/CONTENT_APPROVALS.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build,approval:approved.geometry.review,
 unitPassed:243,unitFiles:37,browserPassed:18,ready:36,preservedOtherEntries:35,preservedPriorRecordings:37,
 commands:[{command:'npx vitest run --maxWorkers=2 --reporter=json --outputFile=output/verification/nya-approval/unit.json',environment:'task-local TEMP/TMP',scope:'complete unit/content suite'},
 {command:'VITE_BUILD_ID=nya-shorter-tip-approved-20261007 npm run build',scope:'approved production build and content validation'},
 {command:'node scripts/build-outline-test-harness.mjs',environment:'JAWI_OUTLINE_HARNESS_DIR=output/verification/nya-approval',scope:'separate current scored Solo/Duo harness'},
 {command:'npx playwright test tests/browser/nya-tip.spec.js --project=chromium --project=webkit --workers=2 --reporter=json',environment:'JAWI_STATIC_TEST=1; configured PLAYWRIGHT_BROWSERS_PATH; task evidence directory',scope:'three student modes, every dot last, revision-4 save/reload, demonstration, phone/tablet guides, eight expired scopes, scored Solo/Duo independent lanes, Ya to Nya to book end'},
 {command:'Invoke-WebRequest -NoProxy against root and letters.json?raw',scope:'existing live Vite server serves exact approved Nya-4 catalogue'}],
 limitations:['Production browser checks use the static fixture; live source checked separately.','Mouse automation is not physical-device input verification.','Audio unchanged; no new audible assessment or playback rerun.'],
 remaining:[],hashes:Object.fromEntries([...new Set(files)].sort().map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({nyaRevision:4,unitPassed:243,browserPassed:18,ready:36,preservedOtherEntries:35,preservedPriorRecordings:37,liveCatalogueExact:true,pendingProposals:0}));
