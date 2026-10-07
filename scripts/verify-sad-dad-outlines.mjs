import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {sadDadReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue,validateLetter} from '../src/content/validateContent.js';
const root='output/verification/sad-dad-outline',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,'')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const letters=read('src/content/letters.json'),previous=read('output/verification/nya-approval/inputs.json');
strictEqual(hash('src/content/letters.json'),previous.hashes['src/content/letters.json']);strictEqual(hash(`${root}/before-catalogue.json`),hash('src/content/letters.json'));
const changed=new Set(['src/content/reviewCandidates.js','src/components/VideoModelReview.jsx']);
for(const [p,sha]of Object.entries(previous.hashes).filter(([p])=>p.startsWith('src/')&&!changed.has(p)))strictEqual(hash(p),sha,p);
for(const [p,sha]of Object.entries(previous.hashes).filter(([p])=>p.startsWith('public/'))){strictEqual(hash(p),sha,p);strictEqual(hash(p.replace(/^public\//,'dist/')),sha,p);}
const proposals=sadDadReviewCandidates(letters);deepStrictEqual(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion]),[['sad',3],['dad',3]]);
for(const {candidate,original}of proposals){deepStrictEqual(validateLetter(candidate),{valid:true,errors:[],ready:false});deepStrictEqual(candidate.audio,original.audio);deepStrictEqual(candidate.geometry.validSequences,original.geometry.validSequences);}
ok(validateCatalogue(letters).valid);strictEqual(validateCatalogue(letters).results.filter(l=>l.ready).length,36);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numFailedTests,0);strictEqual(unit.numPassedTests,247);
const browser=read(`${root}/browser.json`);strictEqual(browser.stats.expected,28);for(const key of ['unexpected','flaky','skipped'])strictEqual(browser.stats[key],0);
const metrics=read(`${root}/appearance-metrics.json`);for(const m of metrics){ok(m.outlineInkOverlap>.99);ok(m.revealPieceOverlap>.99);strictEqual(m.routeInsideInk,1);strictEqual(m.sourceSha256,hash(`node_modules/${proposals.find(p=>p.candidate.id===m.id).candidate.geometry.appearance.source.font}`));}
const server=read(`${root}/server.json`);deepStrictEqual(server,{status:200,exactProposal:true,reviewScope:true});
writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(proposals,null,2)+'\n');
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${d}/${e.name}`):[`${d}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...Object.keys(previous.hashes).filter(p=>p.startsWith('public/')),...walk(root).filter(p=>!p.includes('/temp/')&&!p.endsWith('/inputs.json')),
 `node_modules/${proposals[0].candidate.geometry.appearance.source.font}`,'package.json','package-lock.json','playwright.config.js','scripts/author-sad-dad-outlines.mjs','scripts/measure-sad-dad-outlines.mjs','scripts/verify-sad-dad-outlines.mjs','scripts/build-outline-test-harness.mjs',
 'scripts/lib/glyph-geometry.mjs','scripts/lib/outline-contours.mjs','docs/SAD_DAD_TRACE_APPEARANCE_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'sad-dad-outline-review-20261007',revisions:{sad:3,dad:3},approval:'pendingReview',studentReady:36,preservedCatalogueEntries:36,preservedPriorRecordings:37,unitPassed:247,unitFiles:38,browserPassed:28,metrics,server,
 commands:[{command:'npm test -- --maxWorkers=2 --reporter=json --outputFile=output/verification/sad-dad-outline/unit.json',environment:'task-local TEMP/TMP',scope:'complete unit suite'},
 {command:'VITE_BUILD_ID=sad-dad-outline-review-20261007 npm run build',scope:'content validation and production build'},
 {command:'node scripts/measure-sad-dad-outlines.mjs',scope:'high-resolution actual font overlap, full reveal coverage, route inside ink'},
 {command:'npx playwright test tests/browser/sad-dad-outlines.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',environment:'JAWI_STATIC_TEST=1; configured PLAYWRIGHT_BROWSERS_PATH',scope:'adult proposals in three modes, all movements/dots, phone/tablet/desktop, demonstration preservation, unscored Solo/Duo, approved student isolation'},
 {command:'Invoke-WebRequest -NoProxy to running local source',scope:'exact proposal and new review controls'}],
 visualInspection:['catalogue/outline pairs','Chromium phone Sad play start','WebKit tablet Sad completed guided','Chromium phone Dad completed play','WebKit tablet Dad dot stage'],
 limitations:['Production browser checks use static fixture; live source verified separately.','Mouse automation is not physical-device touch/pen verification.','Recordings unchanged; no new audible assessment required.'],remaining:['Owner approval of pictured Sad 3 and Dad 3, then exact promotion and affected student verification'],hashes:Object.fromEntries([...new Set(files)].sort().map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({unitPassed:247,browserPassed:28,ready:36,studentEntriesPreserved:36,pendingProposals:2}));
