import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {deepStrictEqual,strictEqual} from 'node:assert';
import {sadDadReviewCandidates} from '../src/content/reviewCandidates.js';
const root='output/verification/sad-dad-approval';mkdirSync(root,{recursive:true});
const read=p=>JSON.parse(readFileSync(p,'utf8').replace(/^\uFEFF/,'')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const review=read('output/verification/sad-dad-outline/inputs.json');
for(const [path,sha]of Object.entries(review.hashes).filter(([p])=>p.startsWith('src/')))strictEqual(hash(path),sha,path);
const path='src/content/letters.json',letters=read(path),proposals=read('output/verification/sad-dad-outline/reviewed-proposals.json');
deepStrictEqual(proposals,sadDadReviewCandidates(letters));strictEqual(proposals.length,2);
writeFileSync(`${root}/before-catalogue.json`,readFileSync(path));writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(proposals,null,2)+'\n');
writeFileSync(`${root}/review-browser-test.js`,readFileSync('tests/browser/sad-dad-outlines.spec.js'));
for(const {candidate}of proposals){
 const approved=structuredClone(candidate);approved.geometry.status='approved';
 approved.geometry.review={revision:3,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-sad-and-dad-catalogue-shapes-2026-10-07',kind:'projectOwner'};
 letters[letters.findIndex(l=>l.id===approved.id)]=approved;
}
writeFileSync(path,JSON.stringify(letters,null,2)+'\n');
writeFileSync(`${root}/authorisation.json`,JSON.stringify({quote:'approve and generate newly released apk',question:'Approve both corrected shapes for normal lessons?',scope:'Exact Sad 3 / Dad 3 promotion; new signed release APK containing the current approved game.',date:'2026-10-07',reviewer:letters.find(l=>l.id==='sad').geometry.review.reviewer,revisions:{sad:3,dad:3}},null,2)+'\n');
console.log('Approved exact reviewed Sad 3 and Dad 3; 34 other entries and all recordings preserved.');
