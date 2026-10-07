import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {strictEqual,deepStrictEqual,ok} from 'node:assert';
import {validateCatalogue} from '../src/content/validateContent.js';
import * as reviews from '../src/content/reviewCandidates.js';

const root='output/verification/nga-audio',read=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const previous=read('output/verification/ta-za-approval/inputs.json'),source=read(`${root}/source.json`),generation=read(`${root}/generation.json`);
const before=read(`${root}/before-catalogue.json`),letters=read('src/content/letters.json'),original=before.find(letter=>letter.id==='nga'),nga=letters.find(letter=>letter.id==='nga');
strictEqual(hash(`${root}/before-catalogue.json`),previous.hashes['src/content/letters.json']);
strictEqual(hash(`${root}/before-catalogue.json`),source.catalogueSha256);
for(const [path,sha]of Object.entries(previous.hashes).filter(([path])=>path.startsWith('src/')&&path!=='src/content/letters.json'))strictEqual(hash(path),sha,path);
deepStrictEqual(read('tests/fixtures/nga-audio-original.json'),original);
const restored=structuredClone(letters);restored.find(letter=>letter.id==='nga').audio.name=original.audio.name;deepStrictEqual(restored,before);
strictEqual(nga.contentVersion,4);strictEqual(nga.audio.name.version,2);strictEqual(nga.audio.name.transcriptMs,'Nga');strictEqual(nga.audio.name.status,'approved');
deepStrictEqual(nga.audio.name.review,{revision:2,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/AUDIO_APPROVALS.md#selection-of-supplied-nga-recording-2026-10-07',kind:'projectOwner'});
strictEqual(nga.audio.name.origin.kind,'userProvided');strictEqual(nga.audio.name.synthesis,undefined);
for(const [src,sha]of Object.entries(source.protectedRecordings))strictEqual(hash(`public${src}`),sha,src);
for(const letter of letters)strictEqual(hash(`dist${letter.audio.name.src}`),hash(`public${letter.audio.name.src}`));
strictEqual(hash(source.sourceFile),source.sourceSha256);strictEqual(hash(`${root}/source-user.m4a`),source.sourceSha256);
strictEqual(hash(`public${generation.src}`),generation.sha256);strictEqual(nga.audio.name.origin.recordingSha256,generation.sha256);
strictEqual(hash(`${root}/server-nga.wav`),generation.sha256);strictEqual(generation.duration,1);strictEqual(generation.bytes,48044);
const wave=readFileSync(`public${generation.src}`),master=readFileSync(`${root}/source-user.wav`),rate=24000,fade=Math.round(.005*rate)*2;
ok(wave.subarray(44+fade,wave.length-fade).equals(master.subarray(44+Math.round(.70*rate)*2+fade,44+Math.round(1.70*rate)*2-fade)));
const validation=validateCatalogue(letters);ok(validation.valid);strictEqual(validation.results.filter(letter=>letter.ready).length,37);
for(const factory of Object.values(reviews))deepStrictEqual(factory(letters),[]);

// Retain the initial evidence, replacing only the two historical test files repaired
// for independent Nga audio; application inputs stayed unchanged during the repair.
const initial=read(`${root}/unit-initial.json`),recheck=read(`${root}/unit-recheck.json`);
strictEqual(initial.numTotalTests,218);strictEqual(initial.numFailedTests,2);strictEqual(initial.testResults.length,29);
ok(recheck.success);strictEqual(recheck.numPassedTests,14);strictEqual(recheck.testResults.length,2);
const replacements=new Map(recheck.testResults.map(file=>[file.name,file]));
for(const name of replacements.keys())ok(initial.testResults.some(file=>file.name===name));
const finalFiles=initial.testResults.map(file=>replacements.get(file.name)||file),cases=finalFiles.flatMap(file=>file.assertionResults.map(test=>({file:file.name,title:test.fullName,status:test.status})));
strictEqual(cases.length,218);for(const test of cases)strictEqual(test.status,'passed',test.title);
writeFileSync(`${root}/unit-final.json`,JSON.stringify({description:'204 unchanged initial cases plus 14 current cases from the two repaired historical test files.',passed:218,failed:0,files:29,cases},null,2)+'\n');
const browser=read(`${root}/browser.json`),nativeBrowser=read(`${root}/native-browser.json`);
for(const [report,total]of [[browser,14],[nativeBrowser,1]]){
 strictEqual(report.stats.expected,total);strictEqual(report.stats.unexpected,0);strictEqual(report.stats.flaky,0);strictEqual(report.stats.skipped,0);
}
const native=read(`${root}/browser/native-playback.json`);strictEqual(native.metrics.sha256,generation.sha256);strictEqual(native.metrics.duration,1);strictEqual(native.metrics.clipped,0);ok(native.metrics.rms>.02);deepStrictEqual(native.playback,{starts:2,ended:2});
const server=read(`${root}/server.json`);strictEqual(server.status,200);strictEqual(server.exactCatalogue,true);strictEqual(server.geometryRevision,4);strictEqual(server.audioRevision,2);
strictEqual(server.audio.status,200);strictEqual(server.audio.contentType,'audio/wav');strictEqual(server.audio.bytes,48044);strictEqual(server.audio.sha256,generation.sha256);
ok(readdirSync('dist/assets').filter(path=>path.endsWith('.js')).some(path=>readFileSync(`dist/assets/${path}`,'utf8').includes('nga-user-audio-20261007')));
strictEqual(letters.filter(letter=>letter.audio.name.origin?.kind==='userProvided').length,29);
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${folder}/${entry.name}`):[`${folder}/${entry.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...Object.keys(source.protectedRecordings).map(src=>`public${src}`),`public${generation.src}`,
 'package.json','package-lock.json','playwright.config.js','scripts/prepare-user-nga.mjs','scripts/install-user-nga.mjs','scripts/verify-nga-audio.mjs',
 ...walk(root).filter(path=>!path.endsWith('/inputs.json')),
 'docs/NGA_AUDIO_CORRECTION.md','docs/AUDIO_APPROVALS.md','docs/AUDIO_RECORDING.md','docs/AUDIO_REPLACEMENT_REVIEW.md','docs/CONTENT_REVIEW.md','docs/PROJECT_STATE.md','docs/CURRENT_TASK.md'];
const report={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'nga-user-audio-20261007',
 request:{quote:generation.quote,reviewer:generation.reviewer,scope:generation.scope},selectedRecording:{src:generation.src,version:2,sha256:generation.sha256,bytes:48044,duration:1},
 unchanged:{otherLetters:36,allGeometryAndContentVersions:true,oldRecordingFiles:37,applicationCode:true},inventory:{suppliedRecordings:29,syntheticRecordings:8,studentReady:37,currentProposals:0},
 unit:{initialCommand:'npm test -- --reporter=json --outputFile=output/verification/nga-audio/unit.json',recheckCommand:'npx vitest run tests/geometry/ainFamilyOutlines.test.js tests/game/glyphMatched.test.js --reporter=json --outputFile=output/verification/nga-audio/unit-recheck.json',passed:218,files:29,unchangedCases:204,recheckedCases:14,failed:0},
 browser:{controlledCommand:"npx playwright test tests/browser/nga-audio.spec.js --project=chromium --project=webkit --workers=2 --grep-invert 'native Chromium' --reporter=line,json",nativeCommand:"same file with --project=chromium --workers=1 --grep 'native Chromium'",passed:15,chromium:8,webkitControlled:7,failed:0,skipped:0,productionStaticFixture:true},
 native,server,limits:['No independent phonetic assessment: the owner supplied the requested pronunciation.','Windows WebKit native codec limitation; its checks use controlled media instrumentation.','Physical-device audible playback and touch/pen were not newly tested.','No APK, deployment or publication requested.'],
 hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({audioRevision:2,geometryRevision:4,unitPassed:218,browserPassed:15,nativePlays:2,otherEntriesPreserved:36,oldRecordingsPreserved:37,studentReady:37}));
