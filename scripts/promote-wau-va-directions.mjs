import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {wauVaReviewCandidates} from '../src/content/reviewCandidates.js';
import {validateLetter} from '../src/content/validateContent.js';
const root='output/verification/wau-va-approval';mkdirSync(root,{recursive:true});
const file='src/content/letters.json',bytes=readFileSync(file),letters=JSON.parse(bytes);
const reviewed=wauVaReviewCandidates(letters);
if(reviewed.length!==2)throw Error('Expected the exact unpromoted Wau/Va base revisions');
writeFileSync(`${root}/before-catalogue.json`,bytes);
writeFileSync(`${root}/reviewed-proposals.json`,JSON.stringify(reviewed,null,2)+'\n');
const next=letters.map(letter=>{
 const proposal=reviewed.find(p=>p.candidate.id===letter.id);if(!proposal)return letter;
 const candidate=structuredClone(proposal.candidate);candidate.geometry.status='approved';
 candidate.geometry.review={revision:candidate.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-wau-and-va-left-first-routes-2026-10-07',kind:'projectOwner'};
 if(!validateLetter(candidate).ready)throw Error(`Invalid promotion: ${candidate.id}`);return candidate;
});
writeFileSync(file,JSON.stringify(next,null,2)+'\n');
console.log('Promoted exact reviewed Wau 3 / Va 4; only approval status and review metadata added to proposals.');
