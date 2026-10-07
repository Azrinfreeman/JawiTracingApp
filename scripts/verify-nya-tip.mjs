import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {validateCatalogue,validateLetter} from '../src/content/validateContent.js';
import * as factories from '../src/content/reviewCandidates.js';
const root='output/verification/nya-tip',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex'),current=read('src/content/letters.json'),before=read(`${root}/catalogue-before.json`);
deepStrictEqual(current,before);deepStrictEqual(read('tests/fixtures/nya-tip-original.json'),current.find(l=>l.id==='nya'));
const proposals=factories.nyaTipReviewCandidates(current);strictEqual(proposals.length,1);
const proposalPath=`${root}/reviewed-proposals.json`;
if(existsSync(proposalPath))deepStrictEqual(read(proposalPath),proposals);else writeFileSync(proposalPath,JSON.stringify(proposals,null,2)+'\n');
const {candidate}=proposals[0];strictEqual(candidate.contentVersion,4);strictEqual(candidate.geometry.status,'pendingReview');strictEqual(candidate.geometry.review,null);
ok(validateLetter(candidate).valid);ok(!validateLetter(candidate).ready);deepStrictEqual(candidate.audio,current.find(l=>l.id==='nya').audio);
for(const factory of Object.entries(factories).filter(([name])=>name!=='nyaTipReviewCandidates').map(([,f])=>f))deepStrictEqual(factory(current),[]);
const prior=read('output/verification/hamzah-ye/inputs.json');
const allowed=['src/content/nyaTip.json','src/content/reviewCandidates.js','src/components/VideoModelReview.jsx'];
for(const [p,sha]of Object.entries(prior.hashes).filter(([p])=>p.startsWith('src/')&&!allowed.includes(p)))strictEqual(hash(p),sha,p);
for(const [src,sha]of Object.entries(read('output/verification/hamzah-ye/audio-before.json'))){strictEqual(hash('public'+src),sha,src);strictEqual(hash('dist'+src),sha,src);}
const valid=validateCatalogue(current);ok(valid.valid);strictEqual(valid.results.filter(l=>l.ready).length,36);
const units=read(`${root}/unit.json`),browser=read(`${root}/browser-initial.json`),matches=read(`${root}/browser-matches.json`);
ok(units.success);strictEqual(units.numPassedTests,241);strictEqual(units.numFailedTests,0);strictEqual(units.testResults.length,36);
strictEqual(browser.stats.expected,14);strictEqual(browser.stats.unexpected,4);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
strictEqual(matches.stats.expected,4);strictEqual(matches.stats.unexpected,0);strictEqual(matches.stats.flaky,0);strictEqual(matches.stats.skipped,0);
const visit=s=>[...(s.specs||[]),...(s.suites||[]).flatMap(visit)];
const specs=browser.suites.flatMap(visit);
for(const spec of specs)for(const test of spec.tests)if(test.status==='unexpected')ok(spec.title.startsWith('Nya candidate'));
// The other 14 test definitions are byte-identical; only the four unscored
// challenge expectations were corrected and rerun after the initial report.
const cut="for(const mode of ['solo','duo'])";
strictEqual(readFileSync(`${root}/browser-test-before-assertion-fix.js`,'utf8').split(cut)[0],readFileSync('tests/browser/nya-tip.spec.js','utf8').split(cut)[0]);
deepStrictEqual(read(`${root}/live-catalogue.json`),current);deepStrictEqual(read(`${root}/live-correction.json`),read('src/content/nyaTip.json'));
ok(readFileSync(`${root}/live-index.html`,'utf8').includes('/@vite/client'));
const build='nya-shorter-tip-review-20261007';ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes(build)));
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...Object.keys(read(`${root}/audio-before.json`)).map(p=>'public'+p),
 ...walk(root).filter(p=>!p.includes('/temp/')&&!p.endsWith('/inputs.json')),
 'AGENTS.md','package.json','package-lock.json','playwright.config.js','scripts/author-nya-tip.mjs','scripts/render-nya-tip.mjs','scripts/verify-nya-tip.mjs','scripts/build-outline-test-harness.mjs',
 'docs/NYA_TIP_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build,
 geometryRevision:4,geometryStatus:'pendingReview',studentRevision:3,ready:36,catalogueUnchanged:true,priorRecordingsUnchanged:37,
 unitPassed:241,unitFiles:36,browserPassed:18,
 commands:[{command:'npx vitest run --maxWorkers=2 --reporter=json --outputFile=output/verification/nya-tip/unit.json',environment:'task-local TEMP/TMP',scope:'complete unit/content suite'},
 {command:'VITE_BUILD_ID=nya-shorter-tip-review-20261007 npm run build',scope:'validated production build'},
 {command:'node scripts/build-outline-test-harness.mjs',environment:'JAWI_OUTLINE_HARNESS_DIR=output/verification/nya-tip',scope:'separate unscored candidate harness'},
 {command:'npx playwright test tests/browser/nya-tip.spec.js --project=chromium --project=webkit --workers=2 --reporter=json',environment:'JAWI_STATIC_TEST=1; configured PLAYWRIGHT_BROWSERS_PATH; task evidence directory',scope:'14 unchanged cases passed: three practice modes; phone/tablet/desktop captures; three dots last; isolated preview saves/reload; demonstration; adult comparison; normal Nya unchanged. Four Solo/Duo test expectations failed, preserved in browser-initial.json.'},
 {command:"npx playwright test tests/browser/nya-tip.spec.js --grep 'Nya candidate' --project=chromium --project=webkit --workers=2 --reporter=json",environment:'same production fixture and two-worker runtime',scope:'All four corrected unscored Solo/Duo cases passed; unscored previews deliberately do not save student challenge attempts.'},
 {command:'Invoke-WebRequest -NoProxy against root, letters.json?raw and nyaTip.json?raw',scope:'existing live server; approved catalogue preserved and proposal available'}],
 remaining:'Fresh owner approval of pictured Nya 4, then exact promotion and affected student checks.',
 limitations:['Marked green line interpreted as about logical y=393 with the guide cap accounted for.','Static production browser fixture, with live source checked separately.','Mouse automation is not physical-device verification.','No teacher assessment or owner approval of Nya 4 claimed.'],
 hashes:Object.fromEntries([...new Set(files)].sort().map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({proposal:'Nya 4',studentRevision:3,ready:36,unitPassed:241,browserPassed:18,catalogueUnchanged:true,recordingsUnchanged:37,awaitingOwnerApproval:true}));
