import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {validateCatalogue} from '../src/content/validateContent.js';
import * as factories from '../src/content/reviewCandidates.js';
const root='output/verification/hamzah-ye',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const before=read(`${root}/catalogue-before.json`),current=read('src/content/letters.json');
strictEqual(before.length,37);strictEqual(current.length,36);
deepStrictEqual(current.map(l=>l.id),before.filter(l=>l.id!=='ye').map(l=>l.id));
for(const letter of current.filter(l=>l.id!=='hamzah'))deepStrictEqual(letter,before.find(l=>l.id===letter.id));
const hamzah=current.find(l=>l.id==='hamzah'),old=before.find(l=>l.id==='hamzah'),restored=structuredClone(hamzah);
restored.contentVersion=4;restored.geometry.review=old.geometry.review;
restored.geometry.strokes[0].path=old.geometry.strokes[0].path;restored.geometry.displayPaths=old.geometry.displayPaths;
deepStrictEqual(restored,old);strictEqual(hamzah.contentVersion,5);strictEqual(hamzah.geometry.review.revision,5);
ok(hamzah.geometry.strokes[0].path.endsWith('L 621.8 502.1 L 408.4 560.4'));
for(const [src,sha]of Object.entries(read(`${root}/audio-before.json`))){strictEqual(hash('public'+src),sha);strictEqual(hash('dist'+src),sha);}
const prior=read('output/verification/va-audio/inputs.json');
for(const [p,sha]of Object.entries(prior.hashes).filter(([p])=>p.startsWith('src/')&&!['src/content/letters.json','src/screens/TeacherScreen.jsx'].includes(p)))strictEqual(hash(p),sha,p);
for(const factory of Object.values(factories))deepStrictEqual(factory(current),[]);
const valid=validateCatalogue(current);ok(valid.valid);strictEqual(valid.results.filter(l=>l.ready).length,36);
const units=read(`${root}/unit.json`),browser=read(`${root}/browser.json`);
ok(units.success);strictEqual(units.numFailedTests,0);strictEqual(units.numPassedTests,238);strictEqual(units.testResults.length,35);
strictEqual(browser.stats.expected,20);strictEqual(browser.stats.unexpected,0);strictEqual(browser.stats.flaky,0);strictEqual(browser.stats.skipped,0);
const served=read(`${root}/live-catalogue.json`);deepStrictEqual(served,current);
ok(readFileSync(`${root}/live-index.html`,'utf8').includes('/@vite/client'));
const build='hamzah-straight-tail-no-ye-20261007';
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes(build)));
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...Object.keys(read(`${root}/audio-before.json`)).map(p=>'public'+p),
 ...walk(root).filter(p=>!p.includes('/temp/')&&!p.endsWith('/inputs.json')),
 'package.json','package-lock.json','playwright.config.js','scripts/fix-hamzah-remove-ye.mjs','scripts/render-hamzah-tail.mjs','scripts/verify-hamzah-ye.mjs','scripts/build-outline-test-harness.mjs',
 'docs/HAMZAH_STRAIGHT_TAIL_AND_YE_REMOVAL.md','docs/CONTENT_APPROVALS.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/AUDIO_RECORDING.md','docs/AUDIO_REPLACEMENT_REVIEW.md','README.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build,
 sourceChanges:['src/content/letters.json','src/screens/TeacherScreen.jsx'],hamzahGeometryRevision:5,removedLetter:'ye',ready:36,
 preservedOtherEntries:35,preservedPriorRecordings:37,unitPassed:238,unitFiles:35,browserPassed:20,
 commands:[{command:'npx vitest run --maxWorkers=2 --reporter=json --outputFile=output/verification/hamzah-ye/unit.json',environment:'task-local TEMP/TMP',scope:'complete unit/content suite'},
 {command:'VITE_BUILD_ID=hamzah-straight-tail-no-ye-20261007 npm run build',scope:'content validation and production bundle'},
 {command:'node scripts/build-outline-test-harness.mjs',environment:'JAWI_OUTLINE_HARNESS_DIR=output/verification/hamzah-ye',scope:'separate current Solo/Duo test harness'},
 {command:'npx playwright test tests/browser/hamzah-ye.spec.js --project=chromium --project=webkit --workers=2 --reporter=json',environment:'JAWI_STATIC_TEST=1; PLAYWRIGHT_BROWSERS_PATH configured; task evidence directory',scope:'320x600 phone / 768x1024 tablet / 1024x768 desktop: all practice modes, demo, current saves/reload, review, Ye removal and Ya/Nya navigation, Solo/Duo'},
 {command:'Invoke-WebRequest -NoProxy against / and /src/content/letters.json?raw',scope:'existing live Vite server responds with exact changed catalogue'}],
 limitations:['Production browser checks use the local static fixture because of sandbox sockets.','Mouse automation is not physical-device testing.','No new audio bytes changed; native playback tests not repeated.','Owner approved the specified edit; no subsequent owner inspection or teacher assessment inferred.'],
 hashes:Object.fromEntries([...new Set(files)].sort().map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ready:36,hamzahRevision:5,yeRemoved:true,unitPassed:238,browserPassed:20,preservedOtherEntries:35,preservedPriorRecordings:37,liveCatalogueExact:true}));
