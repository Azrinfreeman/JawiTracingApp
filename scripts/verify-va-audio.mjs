import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {validateCatalogue} from '../src/content/validateContent.js';
import * as factories from '../src/content/reviewCandidates.js';
const root='output/verification/va-audio',read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,'')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const prior=read('output/verification/ha-approval/inputs.json'),source=read(`${root}/source.json`),generation=read(`${root}/generation.json`),before=read(`${root}/before-catalogue.json`),letters=read('src/content/letters.json'),va=letters.find(l=>l.id==='va'),original=before.find(l=>l.id==='va');
strictEqual(hash(`${root}/before-catalogue.json`),prior.hashes['src/content/letters.json']);strictEqual(source.catalogueSha256,prior.hashes['src/content/letters.json']);
for(const [path,sha]of Object.entries(prior.hashes).filter(([p])=>p.startsWith('src/')&&p!=='src/content/letters.json'))strictEqual(hash(path),sha,path);
const restored=structuredClone(letters);restored.find(l=>l.id==='va').audio.name=original.audio.name;deepStrictEqual(restored,before);deepStrictEqual(read('tests/fixtures/va-audio-original.json'),original);
strictEqual(va.contentVersion,3);strictEqual(va.audio.name.version,2);strictEqual(va.audio.name.status,'approved');strictEqual(va.audio.name.transcriptMs,'Va');strictEqual(va.audio.name.synthesis,undefined);
deepStrictEqual(va.audio.name.review,{revision:2,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/AUDIO_APPROVALS.md#selection-of-supplied-va-recording-2026-10-07',kind:'projectOwner'});
strictEqual(va.audio.name.origin.kind,'userProvided');strictEqual(va.audio.name.origin.sha256,source.sourceSha256);strictEqual(va.audio.name.origin.recordingSha256,generation.sha256);
strictEqual(hash(source.sourceFile),source.sourceSha256);strictEqual(hash(`${root}/source-user.m4a`),source.sourceSha256);
for(const [src,sha]of Object.entries(source.protectedRecordings))strictEqual(hash(`public${src}`),sha,src);
for(const letter of letters)strictEqual(hash(`dist${letter.audio.name.src}`),hash(`public${letter.audio.name.src}`));
strictEqual(hash(`public${generation.src}`),generation.sha256);strictEqual(generation.duration,1.1);strictEqual(generation.bytes,52844);
const wave=readFileSync(`public${generation.src}`),master=readFileSync(`${root}/source-user.wav`);ok(wave.subarray(44).equals(master.subarray(44+Math.round(.70*24000)*2,44+Math.round(1.80*24000)*2)));
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);for(const factory of Object.values(factories))deepStrictEqual(factory(letters),[]);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numPassedTests,235);strictEqual(unit.numFailedTests,0);strictEqual(unit.testResults.length,34);
const controlled=read(`${root}/browser-final.json`),nativeReport=read(`${root}/native-browser.json`);
for(const [r,count]of [[controlled,14],[nativeReport,1]]){strictEqual(r.stats.expected,count);strictEqual(r.stats.unexpected,0);strictEqual(r.stats.flaky,0);strictEqual(r.stats.skipped,0);}
const native=read(`${root}/browser/native-playback.json`);strictEqual(native.metrics.sha256,generation.sha256);strictEqual(native.metrics.duration,1.1);strictEqual(native.metrics.clipped,0);ok(native.metrics.rms>.02);deepStrictEqual(native.playback,{starts:2,ended:2});
const server=read(`${root}/server.json`);strictEqual(server.status,200);ok(server.exactCatalogue);strictEqual(server.geometryRevision,3);strictEqual(server.audioRevision,2);strictEqual(server.audio.status,200);deepStrictEqual(server.audio.contentType,['audio/wav']);strictEqual(server.audio.bytes,52844);strictEqual(server.audio.sha256,generation.sha256);strictEqual(hash(`${root}/server-va.wav`),generation.sha256);
ok(readdirSync('dist/assets').filter(p=>p.endsWith('.js')).some(p=>readFileSync(`dist/assets/${p}`,'utf8').includes('va-user-audio-20261007')));
strictEqual(letters.filter(l=>l.audio.name.origin?.kind==='userProvided').length,30);
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...Object.keys(source.protectedRecordings).map(src=>`public${src}`),`public${generation.src}`,...walk(root).filter(p=>!p.includes('/temp/')&&!p.endsWith('/inputs.json')),
 'package.json','package-lock.json','playwright.config.js','scripts/prepare-user-va.mjs','scripts/generate-va-guide.py','scripts/compare-va-guide.mjs','scripts/install-user-va.mjs','scripts/verify-va-audio.mjs','scripts/lib/audio-wave.mjs',
 'docs/VA_AUDIO_CORRECTION.md','docs/AUDIO_APPROVALS.md','docs/AUDIO_RECORDING.md','docs/AUDIO_REPLACEMENT_REVIEW.md','docs/PROJECT_STATE.md','docs/CONTENT_REVIEW.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'va-user-audio-20261007',request:{quote:generation.quote,attachmentConfirmation:generation.attachmentConfirmation,reviewer:generation.reviewer,scope:generation.scope},selected:{src:generation.src,revision:2,duration:1.1,bytes:52844,sha256:generation.sha256},
 preservation:{otherEntries:36,allGeometry:true,oldRecordingFiles:37,applicationModules:true},inventory:{supplied:30,synthetic:7,ready:37,proposals:0},
 unit:{passed:235,files:34,command:'npx vitest run --maxWorkers=2 --reporter=json --outputFile=output/verification/va-audio/unit.json',runtime:'task-local TEMP/TMP'},
 browser:{passed:15,controlledChromiumWebKit:14,nativeChromium:1,command:"npx playwright test tests/browser/va-audio.spec.js --grep-invert 'native Chromium' --project=chromium --project=webkit --workers=2 --reporter=json; native selection --project=chromium --workers=1 --grep 'native Chromium'",staticProductionFixture:true,initialHelperSelectorFailure:'Substring replacement corrupted Dengar; run interrupted and helper fixed with word-boundary replacements; corrected file passed.'},native,server,
 visualInspection:['phone Va sound button','tablet Va guided sound button'],limits:['No independent audible phonetic assessment.','Windows WebKit native codec limitation; controlled media verification only.','Physical devices not newly tested.','No teacher assessment inferred.','No APK or deployment requested.'],hashes:Object.fromEntries(files.map(p=>[p,hash(p)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({audioRevision:2,geometryRevision:3,unitPassed:235,browserPassed:15,nativePlays:2,preservedOtherEntries:36,preservedOldRecordings:37,ready:37}));
