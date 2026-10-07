import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {taZaStemReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/ta-za-stems',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const previous=read('output/verification/video-review-approval/inputs.json'),before=read(`${root}/before-catalogue.json`),letters=read('src/content/letters.json');
strictEqual(hash('src/content/letters.json'),hash(`${root}/before-catalogue.json`));strictEqual(hash('src/content/letters.json'),previous.hashes['src/content/letters.json']);
const changed=new Set(['src/content/reviewCandidates.js','src/components/VideoModelReview.jsx']);
for(const [path,sha]of Object.entries(previous.hashes).filter(([p])=>p.startsWith('src/')&&!changed.has(p)))strictEqual(hash(path),sha,path);
const proposals=taZaStemReviewCandidates(letters);deepStrictEqual(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion]),[['tho',4],['za',4]]);
for(const {original,candidate}of proposals){
 strictEqual(candidate.geometry.status,'pendingReview');strictEqual(candidate.geometry.review,null);deepStrictEqual(candidate.audio,original.audio);
 const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
 restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.strokes[1].path=original.geometry.strokes[1].path;restored.geometry.displayPaths=original.geometry.displayPaths;deepStrictEqual(restored,original);
}
for(const letter of letters){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),previous.hashes[path]);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,212);strictEqual(unit.numFailedTests,0);
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,24);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.exactProposal,true);deepStrictEqual(server.revisions,{tho:4,za:4});
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('ta-za-stem-review-20261006')));
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${folder}/${e.name}`):[`${folder}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...letters.map(l=>`public${l.audio.name.src}`),'package.json','package-lock.json','playwright.config.js','scripts/verify-ta-za-stems.mjs',
 `${root}/before-catalogue.json`,`${root}/unit.json`,`${root}/browser.json`,`${root}/server.json`,...walk(`${root}/browser`),
 'docs/TA_ZA_STEM_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(proposals,null,2)+'\n');files.push(`${root}/reviewed-proposals.json`);
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'ta-za-stem-review-20261006',
 scope:'Ta and Za review revision 4: tall stroke shifted 60 logical units left toward tail number 3; head connector extended to meet it and foot aligned to tail. Original loop/tail curves, top height, dots and order preserved.',approval:'pendingReview',
 revisions:{tho:4,za:4},preservedCatalogue:37,preservedRecordings:37,studentReady:37,
 unit:{command:'npm test -- --reporter=json --outputFile=output/verification/ta-za-stems/unit.json',passed:212,files:unit.testResults.length},
 browser:{command:'npx playwright test tests/browser/ta-za-stems.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:24,chromium:12,webkit:12,failed:0,skipped:0,productionStaticFixture:true},
 server,visualInspection:['Actual-model Ta and Za 1280x800 original/revised comparisons','Phone and tablet shifted-stem tracing states'],
 pending:'Owner review of pictured Ta 4 and Za 4 before student promotion',limits:['Physical-device touch/pen untested','Audio unchanged; controlled browser instrumentation only','No APK or deployment requested'],
 hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({proposals:report.revisions,unitPassed:212,browserPassed:24,preservedCatalogue:37,preservedRecordings:37,studentReady:37}));
