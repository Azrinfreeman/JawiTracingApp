import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {taZaStemReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
import {parsePath} from './lib/glyph-geometry.mjs';
const root='output/verification/ta-za-smooth-join',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const previous=read('output/verification/ta-za-stems/inputs.json'),letters=read('src/content/letters.json');
strictEqual(hash('src/content/letters.json'),hash(`${root}/before-catalogue.json`));strictEqual(hash('src/content/letters.json'),previous.hashes['src/content/letters.json']);
strictEqual(hash(`${root}/previous-proposal.json`),previous.hashes['src/content/taZaStems.json']);
const changed=new Set(['src/content/reviewCandidates.js','src/content/taZaStems.json']);
for(const [path,sha]of Object.entries(previous.hashes).filter(([p])=>p.startsWith('src/')&&!changed.has(p)))strictEqual(hash(path),sha,path);
const proposals=taZaStemReviewCandidates(letters);deepStrictEqual(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion]),[['tho',5],['za',5]]);
const old=read('output/verification/ta-za-stems/reviewed-proposals.json');
for(const {original,candidate}of proposals){
 strictEqual(candidate.geometry.status,'pendingReview');strictEqual(candidate.geometry.review,null);
 const prior=old.find(p=>p.candidate.id===candidate.id).candidate;
 deepStrictEqual(candidate.geometry.strokes[1],prior.geometry.strokes[1]);deepStrictEqual(candidate.geometry.dotTargets,prior.geometry.dotTargets);
 deepStrictEqual(candidate.geometry.validSequences,prior.geometry.validSequences);deepStrictEqual(candidate.audio,original.audio);
 deepStrictEqual(parsePath(candidate.geometry.strokes[0].path).slice(1),parsePath(original.geometry.strokes[0].path).slice(2));
 const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
 restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.strokes[1].path=original.geometry.strokes[1].path;restored.geometry.displayPaths=original.geometry.displayPaths;deepStrictEqual(restored,original);
}
for(const letter of letters){const path=`public${letter.audio.name.src}`;strictEqual(hash(path),previous.hashes[path]);strictEqual(hash(`dist${letter.audio.name.src}`),hash(path));}
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,213);strictEqual(unit.numFailedTests,0);
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,24);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.exactProposal,true);deepStrictEqual(server.revisions,{tho:5,za:5});
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('ta-za-smooth-join-review-20261006')));
writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(proposals,null,2)+'\n');
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${folder}/${e.name}`):[`${folder}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...letters.map(l=>`public${l.audio.name.src}`),'package.json','package-lock.json','playwright.config.js','scripts/verify-ta-za-smooth-join.mjs','scripts/lib/glyph-geometry.mjs',
 `${root}/before-catalogue.json`,`${root}/previous-proposal.json`,`${root}/reviewed-proposals.json`,`${root}/unit.json`,`${root}/browser.json`,`${root}/server.json`,...walk(`${root}/browser`),
 'docs/TA_ZA_SMOOTH_JOIN_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',started:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'ta-za-smooth-join-review-20261006',
 scope:'Ta/Za review 5: flat dent replaced with a single smooth rising cubic tangent to the retained loop. Shifted stems, foot joins, tails, dots and order unchanged from reviewed proposal 4.',
 approval:'pendingReview',revisions:{tho:5,za:5},preservedCatalogue:37,preservedRecordings:37,studentReady:37,
 unit:{command:'npm test -- --reporter=json --outputFile=output/verification/ta-za-smooth-join/unit.json',passed:213,files:unit.testResults.length},
 browser:{command:'npx playwright test tests/browser/ta-za-stems.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:24,chromium:12,webkit:12,failed:0,skipped:0,productionStaticFixture:true},
 server,visualInspection:['Final tablet Ta/Za completed letters','Enlarged copies of actual renderer original/revised SVGs','Phone shifted stem guides'],
 pending:'Owner review of corrected Ta 5 and Za 5 before student promotion',limits:['Physical-device touch/pen untested','Audio unchanged; controlled browser instrumentation only','No APK, deployment or publication requested'],
 hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({proposals:report.revisions,unitPassed:213,browserPassed:24,preservedCatalogue:37,preservedRecordings:37,studentReady:37}));
