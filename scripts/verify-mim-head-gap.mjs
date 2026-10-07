import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,deepStrictEqual,ok} from 'node:assert';
import {videoReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue,validateLetter} from '../src/content/validateContent.js';
const root='output/verification/mim-head-gap',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const preceding=read('output/verification/mim-tail-gap/inputs.json'),current=read('src/content/letters.json');
for(const [path,sha]of Object.entries(preceding.hashes).filter(([p])=>(p.startsWith('src/')&&p!=='src/content/mimTailGap.json')||p.startsWith('public/audio/')))strictEqual(hash(path),sha,path);
strictEqual(hash(`${root}/before-catalogue.json`),preceding.hashes['src/content/letters.json']);deepStrictEqual(current,read(`${root}/before-catalogue.json`));
const previous=read(`${root}/rejected-tail-gap-proposal.json`),proposals=videoReviewCandidates(current),proposal=proposals.find(p=>p.candidate.id==='mim'),candidate=proposal.candidate;
strictEqual(proposals.length,4);strictEqual(previous.candidate.contentVersion,4);strictEqual(candidate.contentVersion,5);
strictEqual(candidate.geometry.strokes.length,1);deepStrictEqual(candidate.geometry.validSequences,[['stroke-1']]);
deepStrictEqual(candidate.audio,previous.candidate.audio);deepStrictEqual(candidate.geometry.dotTargets,[]);
ok(candidate.geometry.strokes[0].path.endsWith(previous.original.geometry.strokes[0].path.replace(/^M\s*[-\d.]+\s+[-\d.]+\s*/,'')));
deepStrictEqual(validateLetter(candidate),{valid:true,errors:[],ready:false});strictEqual(candidate.geometry.review,null);
const catalogue=validateCatalogue(current);ok(catalogue.valid);strictEqual(catalogue.results.filter(l=>l.ready).length,37);
for(const letter of current)strictEqual(hash(`dist${letter.audio.name.src}`),hash(`public${letter.audio.name.src}`));
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,206);strictEqual(unit.numFailedTests,0);
const initial=read(`${root}/browser-initial.json`),recheck=read(`${root}/browser-precision-recheck.json`);
strictEqual(initial.stats.expected,18);strictEqual(initial.stats.unexpected,2);strictEqual(recheck.stats.expected,2);strictEqual(recheck.stats.unexpected,0);
const specs=s=>[...(s.specs||[]),...(s.suites||[]).flatMap(specs)],fixed=specs(recheck),combined=structuredClone(initial);
for(const spec of specs(combined)){
 const replacement=fixed.filter(s=>s.title===spec.title).flatMap(s=>s.tests);
 if(replacement.length){spec.tests=spec.tests.map(t=>{const r=replacement.find(r=>r.projectName===t.projectName);ok(r);return r;});spec.ok=true;}
 else ok(spec.tests.every(t=>t.status==='expected'));
}
const statuses=specs(combined).flatMap(s=>s.tests.map(t=>t.status));strictEqual(statuses.length,20);ok(statuses.every(s=>s==='expected'));
combined.stats={...initial.stats,expected:20,unexpected:0,flaky:0,skipped:0,duration:initial.stats.duration+recheck.stats.duration};
combined.scopeRecheck={initial:'browser-initial.json',recheck:'browser-precision-recheck.json',selection:'precision 1280',stablePassed:18,recheckedPassed:2,reason:'Precision test incorrectly lifted mid-stroke; corrected to one continuous trace. Application source unchanged during repair.',description:'Combined distinct-case evidence; no second full-suite execution.'};
writeFileSync(`${root}/browser-final.json`,JSON.stringify(combined,null,2)+'\n');writeFileSync(`${root}/candidate.json`,JSON.stringify(candidate,null,2)+'\n');
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.revision,5);deepStrictEqual(server.paths,candidate.geometry.strokes.map(s=>s.path));
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('mim-head-gap-review-20261006')));
const walk=f=>readdirSync(f,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${f}/${e.name}`):[`${f}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...current.map(l=>`public${l.audio.name.src}`),'package.json','package-lock.json','playwright.config.js','scripts/verify-mim-head-gap.mjs','scripts/build-outline-test-harness.mjs',
 `${root}/before-catalogue.json`,`${root}/rejected-tail-gap-model.json`,`${root}/tail-gap-unit-test.js`,`${root}/tail-gap-browser-test.js`,`${root}/rejected-tail-gap-proposal.json`,`${root}/candidate.json`,`${root}/test-harness.js`,`${root}/unit.json`,`${root}/browser-initial.json`,`${root}/browser-precision-recheck.json`,`${root}/browser-final.json`,`${root}/server.json`,...walk(`${root}/browser`),'docs/MIM_HEAD_OPENING_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'mim-head-gap-review-20261006',scope:'Mim review revision 5: tiny left head opening, connected tail, one continuous stroke. Incorrect revision 4 rejected; student Mim 2 preserved.',
 approval:'pendingReview',preservedCatalogue:37,preservedRecordings:37,studentReady:37,unit:{command:'npm test -- --reporter=json --outputFile=output/verification/mim-head-gap/unit.json',passed:206,files:25},
 browser:{command:'npx playwright test tests/browser/mim-head-gap.spec.js tests/browser/fix-video.spec.js --grep "Mim keeps|demonstration follows the continuous|review card shows revision|old and revised proposals|adult comparisons" --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:20,failed:0,skipped:0,chromium:10,webkit:10,...combined.scopeRecheck},server,
 visualInspection:['Actual-renderer original-2/revision-5 head-opening comparison','768x1024 play completion with tiny head opening and connected tail'],pending:'Owner approval of pictured Mim 5 before normal-game promotion',limits:['Physical-device touch/pen untested','No APK or deployment requested'],hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({reviewRevision:5,unitPassed:206,browserPassed:20,preservedCatalogue:37,preservedRecordings:37,approval:'pendingReview'}));
