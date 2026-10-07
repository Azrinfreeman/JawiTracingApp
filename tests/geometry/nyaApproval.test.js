import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/nya-tip-original.json';
import * as factories from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
const nya=letters.find(letter=>letter.id==='nya'),[{candidate}]=factories.nyaTipReviewCandidates([original]);
describe('Nya 4 owner approval',()=>{
 it('promotes the exact reviewed shorter tip with matching approval and expires the proposal',()=>{
  const restored=structuredClone(nya);restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
  expect(nya.geometry.review).toEqual({revision:4,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-nya-shorter-tip-2026-10-07',kind:'projectOwner'});
  expect(validateLetter(nya)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(nya);expect(eligiblePool(letters,'ready')).toContain(nya);
  for(const factory of Object.values(factories))expect(factory(letters).filter(p=>p.candidate.id==='nya')).toEqual([]);
  expect(nya.audio).toEqual(original.audio);expect(nya.geometry.dotTargets).toEqual(original.geometry.dotTargets);
 });
 it('preserves old attempts and keeps review completions separate from current student credit in every mode',()=>{
  for(const mode of ['play','guided','precision']){
   const base={profile:'Bunga',letterId:'nya',mode,outcome:{play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode],preview:false,geometryStatus:'approved',audioStatus:'approved'};
   const old={...base,contentVersion:3},preview={...base,contentVersion:4,preview:true,geometryStatus:'pendingReview'};
   const attempts=[old,preview],saved=JSON.stringify(attempts);
   expect(completedBookLetters(letters,{profile:'Bunga',attempts},mode).has('nya')).toBe(false);expect(JSON.stringify(attempts)).toBe(saved);
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,{...base,contentVersion:4}]},mode).has('nya')).toBe(true);
  }
 });
});
