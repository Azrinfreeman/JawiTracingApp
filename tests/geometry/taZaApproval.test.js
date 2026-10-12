import {describe,it,expect} from 'vitest';
import currentLetters from '../../src/content/letters.json';
import approvedOriginalCurves from '../fixtures/ta-za-straight-pillar-originals.json';
import originals from '../fixtures/ta-za-originals.json';
import * as factories from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
// Preserve the October-7 revision-6 approval contract after the later photo approval.
const letters=currentLetters.map(letter=>approvedOriginalCurves.find(original=>original.id===letter.id)||letter);
const base=letters.map(letter=>originals.find(original=>original.id===letter.id)||letter),proposals=factories.taZaStemReviewCandidates(base);
describe('Ta and Za original-curves owner approval (historical revision 6)',()=>{
 it('promotes exact reviewed models with matching approval and clears their proposals',()=>{
  expect(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion])).toEqual([['tho',6],['za',6]]);
  for(const {candidate}of proposals){
   const approved=letters.find(letter=>letter.id===candidate.id),copy=structuredClone(approved);
   expect(validateLetter(approved)).toMatchObject({valid:true,ready:true});
   expect(approved.geometry.review).toMatchObject({revision:6,date:'2026-10-07',kind:'projectOwner',reviewer:'Project owner (Codex user; name not supplied)',reference:'docs/CONTENT_APPROVALS.md#approval-of-ta-and-za-original-curves-2026-10-07'});
   copy.geometry.status='pendingReview';copy.geometry.review=null;expect(copy).toEqual(candidate);
   expect(eligibleBook(letters)).toContain(approved);expect(eligiblePool(letters,'ready')).toContain(approved);
  }
  expect(factories.taZaStemReviewCandidates(letters)).toEqual([]);
 });
 it('preserves old attempts while requiring current approved student completions in every mode',()=>{
  for(const mode of ['play','guided','precision']){
   const outcome={play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode];
   const attempts=originals.map(original=>({profile:'Bunga',letterId:original.id,contentVersion:3,mode,outcome,geometryStatus:'approved',audioStatus:'approved',preview:false}));
   const previews=proposals.map(({candidate})=>({...attempts.find(a=>a.letterId===candidate.id),contentVersion:6,preview:true}));
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,...previews]},mode).size).toBe(0);
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,...previews,...previews.map(a=>({...a,preview:false}))]},mode).size).toBe(2);
   expect(attempts.every(a=>a.contentVersion===3)).toBe(true);
  }
 });
});
