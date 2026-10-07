import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {validateCatalogue} from '../src/content/validateContent.js';
import {videoReviewCandidates} from '../src/content/reviewCandidates.js';

const root='output/verification/ga-audio-approval';
const read=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\uFEFF/,''));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const before=read(`${root}/before-catalogue.json`),current=read('src/content/letters.json');
const guide=read('output/verification/ga-audio-review/user-recording-v7/generation.json');
const authorisation=read(`${root}/authorisation.json`);
strictEqual(hash(`${root}/before-catalogue.json`),guide.catalogueSha256);
strictEqual(current.length,37);
for(const original of before){
  const letter=current.find(item=>item.id===original.id);
  if(original.id!=='ga')deepStrictEqual(letter,original,original.id);
  else{
    const restored=structuredClone(letter);restored.audio.name=original.audio.name;deepStrictEqual(restored,original);
    strictEqual(letter.audio.name.version,7);strictEqual(letter.audio.name.review.revision,7);
    strictEqual(letter.audio.name.status,'approved');strictEqual(letter.audio.name.origin.kind,'userProvided');
    strictEqual(letter.audio.name.src,authorisation.selectedSrc);
    strictEqual(letter.audio.name.review.reference,'docs/AUDIO_APPROVALS.md#approval-of-ga-recording-fallback-2026-10-06');
  }
}
for(const [src,sha]of Object.entries(guide.protectedRecordings))strictEqual(hash(`public${src}`),sha,src);
strictEqual(hash(`public${authorisation.selectedSrc}`),guide.sha256);
strictEqual(hash(`dist${authorisation.selectedSrc}`),guide.sha256);
deepStrictEqual(videoReviewCandidates(current),videoReviewCandidates(before));
strictEqual(videoReviewCandidates(current).length,4);
const previous=read('output/verification/ain-family-approval/inputs.json');
for(const [path,sha]of Object.entries(previous.hashes).filter(([path])=>path.startsWith('src/')&&path!=='src/content/letters.json'))
  strictEqual(hash(path),sha,`Unrelated source changed: ${path}`);
const validation=validateCatalogue(current);ok(validation.valid);strictEqual(validation.results.filter(result=>result.ready).length,37);
strictEqual(current.filter(letter=>letter.audio.name.origin?.kind==='userProvided').length,28);
strictEqual(current.filter(letter=>letter.audio.name.synthesis).length,9);
const unit=read(`${root}/unit.json`);ok(unit.success);strictEqual(unit.numFailedTests,0);strictEqual(unit.numPassedTests,198);
const initial=read(`${root}/browser-initial.json`),recheck=read(`${root}/browser-recheck.json`);
strictEqual(initial.stats.expected,20);strictEqual(initial.stats.unexpected,1);strictEqual(initial.stats.skipped,1);
strictEqual(recheck.stats.expected,2);strictEqual(recheck.stats.unexpected,0);strictEqual(recheck.stats.skipped,0);
const specs=suite=>[...(suite.specs||[]),...(suite.suites||[]).flatMap(specs)];
const correctedTitle='Ga replay preserves partial tracing, obeys mute and stops on letter change';
const replacements=specs(recheck);ok(replacements.every(spec=>spec.title===correctedTitle));
const browser=structuredClone(initial);
for(const spec of specs(browser)){
  if(spec.title!==correctedTitle){ok(spec.tests.every(test=>['expected','skipped'].includes(test.status)));continue;}
  for(let i=0;i<spec.tests.length;i++){
    const replacement=replacements.flatMap(spec=>spec.tests).find(test=>test.projectName===spec.tests[i].projectName);
    ok(replacement);strictEqual(replacement.status,'expected');spec.tests[i]=replacement;
  }spec.ok=true;
}
const statuses=specs(browser).flatMap(spec=>spec.tests.map(test=>test.status));
strictEqual(statuses.filter(status=>status==='expected').length,21);strictEqual(statuses.filter(status=>status==='skipped').length,1);
browser.stats={...initial.stats,expected:21,unexpected:0,flaky:0,skipped:1,duration:initial.stats.duration+recheck.stats.duration};
browser.scopeRecheck={initial:'browser-initial.json',recheck:'browser-recheck.json',affectedTitle:correctedTitle,
  reason:'Controlled 900-ms voice ended before the slower WebKit menu navigation; cancellation fixture now holds the voice active for 60 seconds. Native duration remains separately verified as 1.05 seconds.',
  stablePassedCases:19,correctedPassedCases:2,description:'Combined distinct-case evidence, not a second full-suite execution.'};
writeFileSync(`${root}/browser-final.json`,JSON.stringify(browser,null,2)+'\n');
const native=read(`${root}/browser/native-playback.json`);deepStrictEqual(native.playback,{starts:2,ended:2});
strictEqual(native.metrics.duration,1.05);strictEqual(native.metrics.clipped,0);strictEqual(native.metrics.sha256,guide.sha256);
const server=read(`${root}/server.json`);strictEqual(server.catalogueStatus,200);strictEqual(server.audioStatus,200);
strictEqual(server.gaAudioVersion,7);strictEqual(server.gaContentVersion,3);strictEqual(server.bytes,50444);strictEqual(server.sha256,guide.sha256);
const assets=readdirSync('dist/assets').filter(path=>path.endsWith('.js'));
ok(assets.some(path=>readFileSync(`dist/assets/${path}`,'utf8').includes('ga-user-audio-20261006')));
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${folder}/${entry.name}`):[`${folder}/${entry.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('dist'),...Object.keys(guide.protectedRecordings).map(src=>`public${src}`),
  `public${authorisation.selectedSrc}`,'package.json','package-lock.json','playwright.config.js',
  'scripts/promote-ga-audio.mjs','scripts/verify-ga-audio-approval.mjs','scripts/generate-ga-context.py',
  'scripts/author-ga-context.mjs','scripts/extract-guided-ga.py',
  'docs/AUDIO_APPROVALS.md','docs/AUDIO_RECORDING.md','docs/CONTENT_REVIEW.md',
  'docs/AUDIO_REPLACEMENT_REVIEW.md','docs/GA_AUDIO_REVIEW.md','docs/PROJECT_STATE.md','docs/CURRENT_TASK.md',
  `${root}/before-catalogue.json`,`${root}/authorisation.json`,`${root}/unit.json`,`${root}/browser-final.json`,`${root}/browser-initial.json`,`${root}/browser-recheck.json`,
  `${root}/server.json`,`${root}/browser/native-playback.json`];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'ga-user-audio-20261006',
  authorisation,selectedRecording:{src:authorisation.selectedSrc,version:7,sha256:guide.sha256,bytes:50444,duration:1.05},
  unchanged:{otherLetters:36,allGeometryAndContentVersions:true,originalRecordingFiles:37,applicationCode:true,independentVideoProposals:4},
  inventory:{suppliedRecordings:28,syntheticRecordings:9,studentReady:37},
  unit:{command:'npm test -- --reporter=json --outputFile=output/verification/ga-audio-approval/unit.json',passed:unit.numPassedTests,failed:0,files:unit.testResults.length},
  browser:{command:'npx playwright test tests/browser/ga-audio.spec.js --project=chromium --project=webkit --workers=2 --reporter=line,json',
    productionStaticFixture:true,passed:21,failed:0,skipped:1,skip:'Known Windows WebKit native audio codec limitation; native decode/play/replay verified in Chromium; controlled WebKit lifecycle tests pass.'},
  browserRecheck:{command:'npx playwright test tests/browser/ga-audio.spec.js --grep "partial tracing" --project=chromium --project=webkit --workers=2 --reporter=line,json',
    ...browser.scopeRecheck,initialPassed:20,initialFailed:1,recheckPassed:2,recheckFailed:0},
  native,server,limits:['No new APK or deployment requested.','No professional phonetic assessment or physical-device audible review inferred.'],
  hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({gaAudioVersion:7,studentReady:37,unchangedLetters:36,originalFilesPreserved:37,unitPassed:198,unitFiles:unit.testResults.length,browserPassed:21,knownCodecSkip:1}));
