import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,ok} from 'node:assert';
const root='output/verification/completion-delay';
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const previous=read('output/verification/sin-syin-tail-approval/inputs.json');
for(const [path,sha]of Object.entries(previous.hashes).filter(([p])=>(p.startsWith('src/')&&p!=='src/screens/BookLessonScreen.jsx')||p.startsWith('public/audio/')))strictEqual(hash(path),sha,path);
const letters=read('src/content/letters.json');strictEqual(letters.length,37);
for(const letter of letters)strictEqual(hash(`dist${letter.audio.name.src}`),hash(`public${letter.audio.name.src}`));
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,203);strictEqual(unit.numFailedTests,0);
const first=read(`${root}/browser-before-navigation-fix.json`),recheck=read(`${root}/browser-navigation-recheck.json`);
strictEqual(first.stats.expected,28);strictEqual(first.stats.unexpected,2);strictEqual(first.stats.skipped,2);
strictEqual(recheck.stats.expected,2);strictEqual(recheck.stats.unexpected,0);
const specs=s=>[...(s.specs||[]),...(s.suites||[]).flatMap(specs)];
const combined=structuredClone(first),fixed=specs(recheck);
for(const spec of specs(combined)){
 const replacement=fixed.find(s=>s.title===spec.title);
 if(replacement){spec.tests=replacement.tests;spec.ok=true;}
 else ok(spec.tests.every(t=>['expected','skipped'].includes(t.status)),spec.title);
}
const statuses=specs(combined).flatMap(s=>s.tests.map(t=>t.status));strictEqual(statuses.filter(s=>s==='expected').length,30);strictEqual(statuses.filter(s=>s==='skipped').length,2);
combined.stats={...first.stats,expected:30,unexpected:0,flaky:0,skipped:2,duration:first.stats.duration+recheck.stats.duration};
combined.scopeRecheck={initial:'browser-before-navigation-fix.json',recheck:'browser-navigation-recheck.json',selection:'freezes completed writing',stablePassed:28,recheckedPassed:2,reason:'Older test expected Sin after Sa; current approved catalogue correctly opens Jim. Test corrected; application source unchanged.',description:'Combined distinct-case evidence; no second full-suite execution.'};
writeFileSync(`${root}/browser-final.json`,JSON.stringify(combined,null,2)+'\n');
const server=read(`${root}/server.json`);strictEqual(server.status,200);ok(server.updatedPanelDelayServed);
const assets=readdirSync('dist/assets').filter(p=>p.endsWith('.js'));ok(assets.some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('completion-delay-20261006')));
const walk=f=>readdirSync(f,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${f}/${e.name}`):[`${f}/${e.name}`]);
const files=[...walk('src'),...walk('dist'),...letters.map(l=>`public${l.audio.name.src}`),
 'tests/browser/completion-delay.spec.js','tests/browser/book-layout.spec.js',...walk('tests/browser/helpers'),
 'package.json','package-lock.json','playwright.config.js','scripts/verify-completion-delay.mjs',
 `${root}/unit.json`,`${root}/browser-before-navigation-fix.json`,`${root}/browser-navigation-recheck.json`,`${root}/browser-final.json`,`${root}/layout-before-navigation-fix.js`,`${root}/server.json`,...walk(`${root}/browser`),'docs/COMPLETION_PANEL_DELAY.md','docs/PROJECT_STATE.md'];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'completion-delay-20261006',scope:'All tracing lessons wait 1500ms before showing the completion panel; result save and sound remain immediate. Manual copy behaviour preserved.',
 preservation:{catalogueEntries:37,recordings:37,otherSourceModules:true},unit:{command:'npm test -- --reporter=json --outputFile=output/verification/completion-delay/unit.json',passed:203,files:24},
 browser:{command:'npx playwright test tests/browser/completion-delay.spec.js tests/browser/book-layout.spec.js --grep "finished letter stays|leaving and retrying|freezes completed writing|copy exit offers|native touch completion|stage, tools and completion fit" --project=chromium --project=webkit --workers=2 --reporter=line,json',passed:30,chromium:16,webkit:14,failed:0,skipped:2,skipReason:'Chromium CDP touch is unavailable on WebKit',recheckCommand:'npx playwright test tests/browser/book-layout.spec.js --grep "freezes completed writing" --project=chromium --project=webkit --workers=2 --reporter=line,json',...combined.scopeRecheck},
 server,visualInspection:['Chromium 320x600 Alif finished-letter and panel','Chromium 768x1024 Mim guided finished-letter'],limits:['Physical-device touch/pen untested','No APK or deployment requested'],hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({unitPassed:203,browserPassed:30,knownSkipped:2,preservedCatalogue:37,preservedRecordings:37,panelDelayMs:1500}));
