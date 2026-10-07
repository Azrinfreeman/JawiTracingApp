import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/nun-outline-original.json';
import * as factories from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
const nun=letters.find(letter=>letter.id==='nun');
const [{candidate}]=factories.fourLetterReviewCandidates([original]);
describe('Nun owner approval',()=>{
 it('promotes the exact reviewed model with a matching approval, retaining audio and clearing pending scopes',()=>{
  const restored=structuredClone(nun);restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
  expect(nun.geometry.review).toEqual({revision:3,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-nun-catalogue-outline-2026-10-07',kind:'projectOwner'});
  expect(nun.audio).toEqual(original.audio);expect(validateLetter(nun)).toMatchObject({valid:true,ready:true});
  expect(eligibleBook(letters)).toContain(nun);expect(eligiblePool(letters,'ready')).toContain(nun);
  // Later proposals for other letters do not invalidate Nun's recorded approval.
  for(const factory of Object.values(factories))expect(factory(letters).filter(({candidate})=>candidate.id==='nun')).toEqual([]);
 });
 it('retains prior attempts while requiring current student completions in all modes',()=>{
  for(const mode of ['play','guided','precision']){
   const outcome={play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode];
   const old={profile:'Bunga',letterId:'nun',contentVersion:2,mode,outcome,geometryStatus:'approved',audioStatus:'approved',audioVersion:2,preview:false};
   const preview={...old,contentVersion:3,geometryStatus:'pendingReview',preview:true};
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[old,preview]},mode).size).toBe(0);
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[old,preview,{...preview,geometryStatus:'approved',preview:false}]},mode).size).toBe(1);
   expect(old.contentVersion).toBe(2);expect(preview.preview).toBe(true);
  }
 });
});
