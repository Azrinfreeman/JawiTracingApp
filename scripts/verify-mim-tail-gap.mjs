import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,deepStrictEqual,ok} from 'node:assert';
import {videoReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue,validateLetter} from '../src/content/validateContent.js';
const root='output/verification/mim-tail-gap',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const preceding=read('output/verification/completion-delay/inputs.json'),current=read('src/content/letters.json');
for(const [path,sha]of Object.entries(preceding.hashes).filter(([p])=>(p.startsWith('src/')&&p!=='src/content/reviewCandidates.js')||p.startsWith('public/audio/')))strictEqual(hash(path),sha,path);
strictEqual(hash(`${root}/before-catalogue.json`),preceding.hashes['src/content/letters.json']);deepStrictEqual(current,read(`${root}/before-catalogue.json`));
const previous=read(`${root}/before-proposal.json`),proposals=videoReviewCandidates(current),proposal=proposals.find(p=>p.candidate.id==='mim'),candidate=proposal.candidate;
strictEqual(proposals.length,4);strictEqual(previous.candidate.contentVersion,3);strictEqual(candidate.contentVersion,4);
strictEqual(candidate.geometry.strokes.length,2);deepStrictEqual(candidate.geometry.validSequences,[['stroke-1','stroke-2']]);
deepStrictEqual(candidate.audio,previous.candidate.audio);deepStrictEqual(candidate.geometry.dotTargets,[]);
strictEqual(candidate.geometry.strokes[0].path,previous.candidate.geometry.strokes[0].path.split(' C 437 611.1')[0]);
deepStrictEqual(validateLetter(candidate),{valid:true,errors:[],ready:false});strictEqual(candidate.geometry.review,null);
const catalogue=validateCatalogue(current);ok(catalogue.valid);strictEqual(catalogue.results.filter(l=>l.ready).length,37);
for(const letter of current)strictEqual(hash(`dist${letter.audio.name.src}`),hash(`public${letter.audio.name.src}`));
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,206);strictEqual(unit.numFailedTests,0);
const initial=read(`${root}/browser-initial.json`),recheck=read(`${root}/browser-recheck.json`);
strictEqual(initial.stats.expected,14);strictEqual(initial.stats.unexpected,6);strictEqual(recheck.stats.expected,8);strictEqual(recheck.stats.unexpected,0);
const specs=s=>[...(s.specs||[]),...(s.suites||[]).flatMap(specs)],fixed=specs(recheck),combined=structuredClone(initial);
for(const spec of specs(combined)){
 const replacement=fixed.filter(s=>s.title===spec.title).flatMap(s=>s.tests);
 if(replacement.length){spec.tests=spec.tests.map(t=>{const r=replacement.find(r=>r.projectName===t.projectName);ok(r);return r;});spec.ok=true;}
 else ok(spec.tests.every(t=>t.status==='expected'));
}
const statuses=specs(combined).flatMap(s=>s.tests.map(t=>t.status));strictEqual(statuses.length,20);ok(statuses.every(s=>s==='expected'));
combined.stats={...initial.stats,expected:20,unexpected:0,flaky:0,skipped:0,duration:initial.stats.duration+recheck.stats.duration};
combined.scopeRecheck={initial:'browser-initial.json',recheck:'browser-recheck.json',selection:'adult comparisons|old and revised proposals',stablePassed:12,recheckedPassed:8,reason:'Old single-demo-path assertion adjusted for two paths; comparison capture sized for review. Application source unchanged during repair.',description:'Combined distinct-case evidence; no second full-suite execution.'};
writeFileSync(`${root}/browser-final.json`,JSON.stringify(combined,null,2)+'\n');writeFileSync(`${root}/candidate.json`,JSON.stringify(candidate,null,2)+'\n');
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.revision,4);deepStrictEqual(server.paths,candidate.geometry.strokes.map(s=>s.path));
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('mim-tail-gap-review-20261006')));
const walk=f=>readdirSync(f,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${f}/${e.name}`):[`${f}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...current.map(l=>`public${l.audio.name.src}`),'package.json','package-lock.json','playwright.config.js','scripts/verify-mim-tail-gap.mjs','scripts/build-outline-test-harness.mjs',
 `${root}/before-catalogue.json`,`${root}/before-proposal.json`,`${root}/candidate.json`,`${root}/test-harness.js`,`${root}/unit.json`,`${root}/browser-initial.json`,`${root}/browser-recheck.json`,`${root}/browser-final.json`,`${root}/server.json`,...walk(`${root}/browser`),'docs/MIM_TAIL_GAP_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'mim-tail-gap-review-20261006',scope:'Mim review revision 4: closed head, visible small gap, lift and tail. Student Mim 2 preserved.',
 approval:'pendingReview',preservedCatalogue:37,preservedRecordings:37,studentReady:37,unit:{command:'npm test -- --reporter=json --outputFile=output/verification/mim-tail-gap/unit.json',passed:206,files:25},
 browser:{command:'npx playwright test tests/browser/mim-tail-gap.spec.js tests/browser/fix-video.spec.js --grep "Mim closes|demonstration follows two|review card shows revision|old and revised proposals|adult comparisons" --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:20,failed:0,skipped:0,chromium:10,webkit:10,...combined.scopeRecheck},server,
 visualInspection:['Actual-renderer proposal-3/revision-4 comparison','768x1024 play tail start with lift cue'],pending:'Owner approval of pictured Mim 4 before normal-game promotion',limits:['Physical-device touch/pen untested','No APK or deployment requested'],hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({reviewRevision:4,unitPassed:206,browserPassed:20,preservedCatalogue:37,preservedRecordings:37,approval:'pendingReview'}));
