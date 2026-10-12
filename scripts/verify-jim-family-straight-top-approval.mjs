import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import * as factories from '../src/content/reviewCandidates.js';
import {validateLetter} from '../src/content/validateContent.js';
import {eligibleBook} from '../src/game/bookNavigation.js';
import {eligiblePool} from '../src/game/matchConfig.js';

const root='output/verification/jim-family-straight-top-approval';
const read=file=>JSON.parse(readFileSync(file,'utf8'));
const before=read(`${root}/before-catalogue.json`),current=read('src/content/letters.json'),reviewed=read(`${root}/reviewed-proposals.json`);
const hash=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
for(const {candidate}of reviewed){
 const letter=current.find(l=>l.id===candidate.id),restored=structuredClone(letter);restored.geometry.status='pendingReview';restored.geometry.review=null;
 if(JSON.stringify(restored)!==JSON.stringify(candidate))throw Error(`Reviewed candidate changed: ${letter.id}`);
 if(!validateLetter(letter).ready||!eligibleBook(current).includes(letter)||!eligiblePool(current,'ready').includes(letter))throw Error(`Not student/challenge ready: ${letter.id}`);
 if(JSON.stringify(letter.audio)!==JSON.stringify(before.find(l=>l.id===letter.id).audio))throw Error(`Audio changed: ${letter.id}`);
 if(letter.geometry.review.date!=='2026-10-11'||letter.geometry.review.revision!==letter.contentVersion||letter.geometry.review.kind!=='projectOwner'||letter.geometry.review.reference!=='docs/CONTENT_APPROVALS.md#approval-of-jim-ca-ha-and-kha-straight-tops-2026-10-11')throw Error(`Approval provenance mismatch: ${letter.id}`);
}
const unrelated=current.filter(l=>!reviewed.some(p=>p.candidate.id===l.id));
for(const letter of unrelated)if(JSON.stringify(letter)!==JSON.stringify(before.find(l=>l.id===letter.id)))throw Error(`Unrelated entry changed: ${letter.id}`);
const audio=read('output/verification/jim-family-straight-tops/preserved-inputs.json').filter(f=>f.Path!==resolve('src/content/letters.json'));
for(const file of audio)if(hash(file.Path).toUpperCase()!==file.Hash)throw Error(`Audio-tree file changed: ${file.Path}`);
const scopes=Object.entries(factories).map(([name,factory])=>({name,count:factory(current).length}));
if(scopes.some(s=>s.count))throw Error('Obsolete review proposal remains');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(`${dir}/${entry.name}`):[`${dir}/${entry.name}`]);
const files=[...walk('src'),...walk('tests'),...walk('scripts/lib'),...walk('dist/assets'),'dist/index.html','package.json','package-lock.json','vite.config.js','playwright.config.js',
 'scripts/promote-jim-family-straight-tops.mjs','scripts/verify-jim-family-straight-top-approval.mjs','scripts/build-outline-test-harness.mjs',`${root}/test-harness.js`,`${root}/before-catalogue.json`,`${root}/reviewed-proposals.json`];
const evidence={date:'2026-10-11',timezone:'Asia/Kuala_Lumpur',node:process.version,
 approved:reviewed.map(p=>({id:p.candidate.id,revision:p.candidate.contentVersion,review:current.find(l=>l.id===p.candidate.id).geometry.review})),
 exactReviewedCandidates:true,unrelatedEntriesPreserved:unrelated.length,audioTreeFilesPreserved:audio.length,ready:current.filter(l=>validateLetter(l).ready).length,reviewScopes:scopes,
 environment:{productionFixture:'JAWI_STATIC_TEST=1',browserPath:'C:/Users/azrin/AppData/Local/ms-playwright',unitTemp:`${root}/temp`,unitPool:'threads, maxWorkers=2',controlledAudioLifecycle:true,physicalDeviceVerified:false},
 sha256:Object.fromEntries(files.map(file=>[file,hash(file)]))};
writeFileSync(`${root}/verification.json`,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({exactReviewedCandidates:true,unrelatedPreserved:unrelated.length,ready:evidence.ready,emptyReviewScopes:scopes.length,audioTreeFilesPreserved:audio.length,inputHashes:files.length}));
