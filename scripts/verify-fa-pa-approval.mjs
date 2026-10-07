import {readFileSync,writeFileSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual,ok} from 'node:assert';
import {faPaReviewCandidates,videoReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateCatalogue} from '../src/content/validateContent.js';
const root='output/verification/fa-pa-approval';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const implementation=read('output/verification/fa-pa-order/inputs.json');
const before=read(`${root}/before-catalogue.json`),current=read('src/content/letters.json');
strictEqual(hash(`${root}/before-catalogue.json`),implementation.hashes['src/content/letters.json']);
for(const path of ['src/content/faPaDirections.json','src/content/reviewCandidates.js','src/tracing/teachingCues.js'])
  strictEqual(hash(path),implementation.hashes[path],`Reviewed source changed: ${path}`);
const proposals=faPaReviewCandidates(before);deepStrictEqual(proposals.map(p=>p.candidate.id),['fa','pa']);
const expected=before.map(original=>{
  const proposal=proposals.find(p=>p.candidate.id===original.id);if(!proposal)return original;
  const approved=structuredClone(proposal.candidate);approved.geometry.status='approved';
  approved.geometry.review={revision:4,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-06',
    reference:'docs/CONTENT_APPROVALS.md#approval-of-fa-and-pa-directions-2026-10-06',kind:'projectOwner'};
  return approved;
});deepStrictEqual(current,expected);
strictEqual(faPaReviewCandidates(current).length,0);
deepStrictEqual(videoReviewCandidates(current),videoReviewCandidates(before));
deepStrictEqual(current.map(l=>l.audio),before.map(l=>l.audio));
const audio=current.map(l=>`public${l.audio.name.src}`);
for(const path of audio)strictEqual(hash(path),implementation.hashes[path]);
const validation=validateCatalogue(current);ok(validation.valid);strictEqual(validation.results.filter(l=>l.ready).length,37);
let browser=null;
const browserFile=`${root}/browser-final.json`;
if(existsSync(browserFile)){
  const result=read(browserFile);strictEqual(result.stats.expected,24);strictEqual(result.stats.unexpected,0);
  strictEqual(result.stats.flaky,0);strictEqual(result.stats.skipped,0);
  browser={passed:24,chromium:12,webkit:12,failures:0,skipped:0,report:browserFile};
}
const walk=folder=>readdirSync(folder,{withFileTypes:true}).flatMap(entry=>{
  const path=`${folder}/${entry.name}`;return entry.isDirectory()?walk(path):[path];
});
const files=[...walk('src'),...walk('tests'),...walk('dist'),...audio,'package.json','package-lock.json',
  'playwright.config.js','scripts/verify-fa-pa-approval.mjs',`${root}/before-catalogue.json`,...(browser?[browserFile]:[])];
const report={date:'2026-10-06',timezone:'Asia/Kuala_Lumpur',node:process.version,build:'fa-pa-approved-20261006',
  approval:{quote:'approve',reviewer:'Project owner (Codex user; name not supplied)',revisions:{fa:4,pa:4}},
  exactReviewedModelsPreserved:true,unrelatedEntriesPreserved:35,qafAndFourOutlinesUnchanged:true,
  allAudioMetadataPreserved:true,recordingsPreserved:audio.length,olderVideoProposalsPreserved:7,obsoleteDirectionProposals:0,
  studentReady:37,browser,hashes:Object.fromEntries(files.map(path=>[path,hash(path)]))};
writeFileSync(`${root}/inputs.json`,JSON.stringify(report,null,2)+'\n');
console.log('Verified Fa 4 and Pa 4 match the approved candidates; 35 other entries, all recordings and 7 older proposals preserved; 37 ready lessons.');
