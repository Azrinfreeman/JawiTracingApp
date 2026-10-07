import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {taZaStemReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
import {parsePath} from './lib/glyph-geometry.mjs';
const root='output/verification/ta-za-original-curve',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const previous=read('output/verification/ta-za-smooth-join/inputs.json'),letters=read('src/content/letters.json');
strictEqual(hash('src/content/letters.json'),hash(`${root}/before-catalogue.json`));strictEqual(hash('src/content/letters.json'),previous.hashes['src/content/letters.json']);
strictEqual(hash(`${root}/previous-proposal.json`),previous.hashes['src/content/taZaStems.json']);
const changed=new Set(['src/content/reviewCandidates.js','src/content/taZaStems.json']);
for(const [path,sha]of Object.entries(previous.hashes).filter(([p])=>p.startsWith('src/')&&!changed.has(p)))strictEqual(hash(path),sha,path);
const proposals=taZaStemReviewCandidates(letters);deepStrictEqual(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion]),[['tho',6],['za',6]]);
const shift=segments=>segments.map(segment=>segment.map(p=>({x:+(p.x-60).toFixed(1),y:p.y})));
for(const {original,candidate}of proposals){
 strictEqual(candidate.geometry.status,'pendingReview');strictEqual(candidate.geometry.review,null);deepStrictEqual(candidate.audio,original.audio);
 deepStrictEqual(parsePath(candidate.geometry.strokes[0].path).slice(0,4),shift(parsePath(original.geometry.strokes[0].path).slice(0,4)));
 deepStrictEqual(parsePath(candidate.geometry.strokes[1].path),shift(parsePath(original.geometry.strokes[1].path)));
 deepStrictEqual(parsePath(candidate.geometry.strokes[0].path).at(-1).at(-1),{x:310,y:575});
 deepStrictEqual(candidate.geometry.dotTargets,original.geometry.dotTargets.map(dot=>({...dot,x:dot.x-60})));deepStrictEqual(candidate.geometry.validSequences,original.geometry.validSequences);
 const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
 restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.strokes[1].path=original.geometry.strokes[1].path;restored.geometry.dotTargets=original.geometry.dotTargets;restored.geometry.displayPaths=original.geometry.displayPaths;deepStrictEqual(restored,original);
}
for(const letter of letters){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),previous.hashes[path]);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,213);strictEqual(unit.numFailedTests,0);
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,24);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.exactProposal,true);deepStrictEqual(server.revisions,{tho:6,za:6});
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('ta-za-original-curve-review-20261007')));
writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(proposals,null,2)+'\n');
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${folder}/${e.name}`):[`${folder}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...letters.map(l=>`public${l.audio.name.src}`),'package.json','package-lock.json','playwright.config.js','scripts/verify-ta-za-original-curve.mjs','scripts/lib/glyph-geometry.mjs',
 `${root}/before-catalogue.json`,`${root}/previous-proposal.json`,`${root}/reviewed-proposals.json`,`${root}/unit.json`,`${root}/browser.json`,`${root}/server.json`,...walk(`${root}/browser`),
 'docs/TA_ZA_ORIGINAL_CURVE_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'ta-za-original-curve-review-20261007',
 scope:'Ta/Za review 6: original 3 head/loop and entire stem translated 60 units left without reshaping; tail finish 3 retained and its final approach shortened. Za dot translated with head.',
 approval:'pendingReview',revisions:{tho:6,za:6},preservedCatalogue:37,preservedRecordings:37,studentReady:37,
 unit:{command:'npm test -- --reporter=json --outputFile=output/verification/ta-za-original-curve/unit.json',passed:213,files:unit.testResults.length},
 browser:{command:'npx playwright test tests/browser/ta-za-stems.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:24,chromium:12,webkit:12,failed:0,skipped:0,productionStaticFixture:true},
 server,visualInspection:['Final tablet Ta/Za completed letters','Enlarged actual original-3/revision-6 SVG comparison','Phone shifted stem guides'],
 pending:'Owner review of corrected Ta 6 and Za 6 before student promotion',limits:['Physical-device touch/pen untested','Audio unchanged; controlled browser instrumentation only','No APK, deployment or publication requested'],
 hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({proposals:report.revisions,unitPassed:213,browserPassed:24,preservedCatalogue:37,preservedRecordings:37,studentReady:37}));
