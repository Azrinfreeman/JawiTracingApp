import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {ainFamilyReviewCandidates,videoReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/ain-family-approval';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const implementation=read('output/verification/ain-family-outlines/inputs.json');
const before=read(`${root}/before-catalogue.json`),current=read('src/content/letters.json');
strictEqual(hash(`${root}/before-catalogue.json`),implementation.hashes['src/content/letters.json']);
// Approval promotes the identified review build. Rendering, authored data and input behaviour remain exact.
for(const path of Object.keys(implementation.hashes).filter(path=>path.startsWith('src/')&&path!=='src/content/letters.json'))
  strictEqual(hash(path),implementation.hashes[path],`Reviewed source changed: ${path}`);
const proposals=ainFamilyReviewCandidates(before);deepStrictEqual(proposals.map(p=>p.candidate.id),['ain','ghain','nga']);
const expected=before.map(original=>{
  const proposal=proposals.find(p=>p.candidate.id===original.id);if(!proposal)return original;
  const approved=structuredClone(proposal.candidate);approved.geometry.status='approved';
  approved.geometry.review={revision:4,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-06',
    reference:'docs/CONTENT_APPROVALS.md#approval-of-ain-ghain-and-nga-outlines-2026-10-06',kind:'projectOwner'};
  return approved;
});deepStrictEqual(current,expected);
strictEqual(ainFamilyReviewCandidates(current).length,0);
deepStrictEqual(videoReviewCandidates(current),videoReviewCandidates(before).filter(p=>!['ain','ghain','nga'].includes(p.candidate.id)));
strictEqual(videoReviewCandidates(current).length,4);
deepStrictEqual(current.map(l=>l.audio),before.map(l=>l.audio));
const audio=current.map(l=>`public${l.audio.name.src}`);
for(const path of audio)strictEqual(hash(path),implementation.hashes[path]);
const validation=validateCatalogue(current);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
let browser=null;const browserFile=`${root}/browser-final.json`;
if(existsSync(browserFile)){
 const result=read(browserFile);strictEqual(result.stats.expected,44);strictEqual(result.stats.unexpected,0);
 strictEqual(result.stats.flaky,0);strictEqual(result.stats.skipped,0);
 browser={passed:44,chromium:22,webkit:22,failures:0,skipped:0,report:browserFile};
}
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{
  const path=`${folder}/${entry.name}`;return entry.isDirectory()?walk(path):[path];
});
const files=[...walk('src'),...walk('tests'),...walk('dist'),...audio,'package.json','package-lock.json',
  'playwright.config.js','scripts/verify-ain-family-approval.mjs',`${root}/test-harness.js`,`${root}/before-catalogue.json`,...(browser?[browserFile]:[])];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'ain-family-approved-20261006',
 approval:{quote:'proceed',context:'Reply to the explicit request to approve the identified corrected Ain/Ghain/Nga catalogue outlines for the game',reviewer:'Project owner (Codex user; name not supplied)',revisions:{ain:4,ghain:4,nga:4}},
 exactReviewedModelsAndRenderersPreserved:true,unrelatedEntriesPreserved:34,allAudioMetadataPreserved:true,recordingsPreserved:audio.length,
 remainingOlderVideoProposalsPreserved:4,supersededAinFamilyAlternativesRemoved:3,studentReady:37,
 server:{url:'http://127.0.0.1:5173/src/content/letters.json',status:200,checkedRevisions:{ain:4,ghain:4,nga:4},allApproved:true,appearance:'catalogueOutline'},
 unit:{distinctPassed:195,files:22,initial:{command:'npm test -- --reporter=dot',passed:194,failed:1},recheck:{command:'npx vitest run tests/geometry/outlineAppearance.test.js --reporter=dot',file:'tests/geometry/outlineAppearance.test.js',passed:6,failed:0},reason:'Historical four-outline test incorrectly excluded all outline letters instead of its four candidate IDs; scoped assertion and current proposal count corrected.'},
 browser,hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log('Verified exact approved Ain 4/Ghain 4/Nga 4; 34 other entries, all recordings and four remaining proposals preserved; 37 ready lessons.');
