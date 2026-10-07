import {describe,it,expect} from 'vitest';
import currentLetters from '../../src/content/letters.json';
import hamzahOriginal from '../fixtures/hamzah-tail-original.json';
import originals from '../fixtures/video-review-originals.json';
import * as factories from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
// This record verifies the October 6 promotion; Hamzah 5 has separate checks.
const letters=currentLetters.map(letter=>letter.id==='hamzah'?hamzahOriginal:letter);
const before=letters.map(letter=>originals.find(old=>old.id===letter.id)||letter);
const proposals=factories.videoReviewCandidates(before);
describe('Owner approval of all current Semakan video proposals',()=>{
 it('promotes the exact four reviewed revisions into student and challenge pools, clearing their proposals',()=>{
  expect(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion])).toEqual([['mim',5],['ta-marbuta',4],['hamzah',4],['jim',4]]);
  for(const {candidate}of proposals){
   const approved=letters.find(l=>l.id===candidate.id),restored=structuredClone(approved);
   expect(validateLetter(approved)).toMatchObject({valid:true,ready:true});
   expect(approved.geometry.review).toMatchObject({revision:candidate.contentVersion,date:'2026-10-06',kind:'projectOwner',reference:'docs/CONTENT_APPROVALS.md#approval-of-all-current-semakan-video-proposals-2026-10-06'});
   restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
   expect(eligibleBook(letters)).toContain(approved);expect(eligiblePool(letters,'ready')).toContain(approved);
  }
  for(const name of ['videoReviewCandidates','fourLetterReviewCandidates','faPaReviewCandidates','ainFamilyReviewCandidates','sinSyinTailReviewCandidates']){
   expect(factories[name](letters).filter(proposal=>originals.some(original=>original.id===proposal.candidate.id))).toEqual([]);
  }
 });
 it('retains old attempts but requires the approved revision and a non-preview completion in every practice mode',()=>{
  for(const mode of ['play','guided','precision']){
   const outcome={play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode];
   const attempts=originals.map(original=>({profile:'Bunga',letterId:original.id,contentVersion:original.contentVersion,mode,outcome,geometryStatus:'approved',audioStatus:'approved',preview:false}));
   const previews=proposals.map(({candidate})=>({...attempts.find(a=>a.letterId===candidate.id),contentVersion:candidate.contentVersion,preview:true}));
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,...previews]},mode).size).toBe(0);
   const current=previews.map(a=>({...a,preview:false}));
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,...previews,...current]},mode).size).toBe(4);
   expect(attempts.map(a=>a.contentVersion)).toEqual(originals.map(l=>l.contentVersion));
  }
 });
});
