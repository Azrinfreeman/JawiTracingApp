import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import * as factories from '../src/content/reviewCandidates.js';
import {validateLetter} from '../src/content/validateContent.js';
import {eligibleBook} from '../src/game/bookNavigation.js';
import {eligiblePool} from '../src/game/matchConfig.js';
const root='output/verification/wau-va-approval',before=JSON.parse(readFileSync(`${root}/before-catalogue.json`)),current=JSON.parse(readFileSync('src/content/letters.json'));
const reviewed=JSON.parse(readFileSync(`${root}/reviewed-proposals.json`)),previousEvidence=JSON.parse(readFileSync('output/verification/wau-va-direction/inputs.json'));
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(const {candidate}of reviewed){
 const letter=current.find(l=>l.id===candidate.id),restored=structuredClone(letter);restored.geometry.status='pendingReview';restored.geometry.review=null;
 if(JSON.stringify(restored)!==JSON.stringify(candidate))throw Error(`Reviewed candidate changed: ${letter.id}`);
 if(!validateLetter(letter).ready||!eligibleBook(current).includes(letter)||!eligiblePool(current,'ready').includes(letter))throw Error(`Not student/challenge ready: ${letter.id}`);
 if(JSON.stringify(letter.audio)!==JSON.stringify(before.find(l=>l.id===letter.id).audio))throw Error(`Audio metadata changed: ${letter.id}`);
}
const unrelated=current.filter(l=>!['wau','va'].includes(l.id));
for(const letter of unrelated)if(JSON.stringify(letter)!==JSON.stringify(before.find(l=>l.id===letter.id)))throw Error(`Unrelated entry changed: ${letter.id}`);
for(const recording of previousEvidence.audio)if(hash(`public${recording.metadata.name.src}`)!==recording.hash)throw Error(`Recording changed: ${recording.id}`);
const scopes=Object.entries(factories).map(([name,factory])=>({name,count:factory(current).length}));if(scopes.some(s=>s.count))throw Error('An obsolete review proposal remains');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${dir}/${entry.name}`):[`${dir}/${entry.name}`]);
const files=[...walk('src'),...walk('public/audio/letters'),...walk('dist').filter(file=>/index.*\.(js|css|html)$/.test(file)),
 'tests/geometry/wauVaDirections.test.js','tests/audio/vaRecording.test.js','tests/game/glyphMatched.test.js','tests/browser/wau-va-directions.spec.js',...walk('tests/browser/helpers'),
 'scripts/promote-wau-va-directions.mjs','scripts/verify-wau-va-approval.mjs','scripts/build-outline-test-harness.mjs','tests/browser/fixtures/outlineMatchHarness.jsx',
 `${root}/before-catalogue.json`,`${root}/reviewed-proposals.json`,`${root}/test-harness.js`,'package.json','package-lock.json','playwright.config.js'];
const evidence={date:'2026-10-07',timezone:'Asia/Kuala_Lumpur',node:process.version,server:'http://127.0.0.1:5173/',environment:'Existing Vite source server; installed Chromium/WebKit; controlled audio lifecycle; CDP emulated touch/pen',
 approved:reviewed.map(({candidate})=>({id:candidate.id,revision:candidate.contentVersion,review:current.find(l=>l.id===candidate.id).geometry.review})),
 exactReviewedCandidates:true,unrelatedEntriesPreserved:unrelated.length,audioMetadataPreserved:true,reviewedAudioFilesPreserved:previousEvidence.audio.length,
 ready:current.filter(l=>validateLetter(l).ready).length,reviewScopes:scopes,
 checks:[{command:'npm test (workspace TEMP/TMP)',scope:'40 unit files',passed:256},{command:'npm run build',scope:'Content validation and production bundle',result:'passed'},
 {command:'node scripts/build-outline-test-harness.mjs',scope:'Fresh test-only Solo/Duo harness',result:'passed'},
 {command:'npx playwright test tests/browser/wau-va-directions.spec.js --project=chromium --project=webkit --workers=2',scope:'Student play/guided/precision, demos, release/resume, saved status/revision, phone/tablet/desktop, touch/pen, Solo/Duo scoring and expiry',passed:32,skipped:4,reason:'Chromium-only CDP input cases'}],
 limitations:['Physical tablet/smartboard not connected; emulated input only','Audio files preserved; no new audition needed','No new APK requested'],sha256:Object.fromEntries(files.map(file=>[file,hash(file)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({exactReviewedCandidates:true,unrelatedPreserved:unrelated.length,ready:evidence.ready,emptyReviewScopes:scopes.length,audioAssetHashes:walk('public/audio/letters').length,inputHashes:files.length}));
