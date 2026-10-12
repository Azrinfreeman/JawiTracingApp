import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {jimFamilyStraightTopReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter} from '../src/content/validateContent.js';

const root='output/verification/jim-family-straight-top-approval';
const review=JSON.parse(readFileSync('output/verification/jim-family-straight-tops/verification.json','utf8'));
for(const file of ['src/content/letters.json','src/content/jimFamilyStraightTops.json','src/content/reviewCandidates.js']){
 const recorded=review.fingerprints.find(entry=>entry.Path===resolve(file));
 const hash=createHash('sha256').update(readFileSync(file)).digest('hex').toUpperCase();
 if(!recorded||recorded.Hash!==hash)throw Error(`Reviewed input changed: ${file}`);
}
const file='src/content/letters.json',bytes=readFileSync(file),letters=JSON.parse(bytes);
const reviewed=jimFamilyStraightTopReviewCandidates(letters);
if(JSON.stringify(reviewed.map(p=>[p.candidate.id,p.candidate.contentVersion]))!==JSON.stringify([['jim',5],['ca',4],['ha-pedat',4],['kha',4]]))throw Error('Expected the four exact reviewed revisions');
const next=letters.map(letter=>{
 const proposal=reviewed.find(p=>p.candidate.id===letter.id);if(!proposal)return letter;
 const candidate=structuredClone(proposal.candidate);candidate.geometry.status='approved';
 candidate.geometry.review={revision:candidate.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-11',reference:'docs/CONTENT_APPROVALS.md#approval-of-jim-ca-ha-and-kha-straight-tops-2026-10-11',kind:'projectOwner'};
 if(!validateLetter(candidate).ready)throw Error(`Invalid promotion: ${candidate.id}`);
 return candidate;
});
mkdirSync(root,{recursive:true});writeFileSync(`${root}/before-catalogue.json`,bytes);
writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(reviewed,null,2)+'\n');
writeFileSync(file,JSON.stringify(next,null,2)+'\n');
console.log('Promoted exact reviewed Jim 5 / Ca 4 / Ha (ح) 4 / Kha 4; only approval status/review added to candidates.');
