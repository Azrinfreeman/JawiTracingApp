import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/sad-dad-originals.json';
import * as factories from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
const proposals=factories.sadDadReviewCandidates(originals);
describe('Sad and Dad approved catalogue shapes',()=>{
 it('promotes exact reviewed geometry with matching approval, keeping audio and expiring proposals',()=>{
  for(const {original,candidate}of proposals){
   const current=letters.find(l=>l.id===candidate.id),restored=structuredClone(current);restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
   expect(current.geometry.review).toEqual({revision:3,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-sad-and-dad-catalogue-shapes-2026-10-07',kind:'projectOwner'});
   expect(current.audio).toEqual(original.audio);expect(validateLetter(current)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(current);expect(eligiblePool(letters,'ready')).toContain(current);
  }
  for(const factory of Object.values(factories))expect(factory(letters)).toEqual([]);
 });
 it('retains old and preview attempts without awarding current student credit in three modes',()=>{
  for(const {candidate}of proposals)for(const mode of ['play','guided','precision']){
   const base={profile:'Bunga',letterId:candidate.id,mode,outcome:{play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode],geometryStatus:'approved',audioStatus:'approved',preview:false};
   const attempts=[{...base,contentVersion:2},{...base,contentVersion:3,geometryStatus:'pendingReview',preview:true}],saved=JSON.stringify(attempts);
   expect(completedBookLetters(letters,{profile:'Bunga',attempts},mode).has(candidate.id)).toBe(false);expect(JSON.stringify(attempts)).toBe(saved);
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,{...base,contentVersion:3}]},mode).has(candidate.id)).toBe(true);
  }
 });
});
