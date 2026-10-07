import {it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/ha-direction-original.json';
import * as factories from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
const ha=letters.find(letter=>letter.id==='ha'),[{candidate}]=factories.haDirectionReviewCandidates([original]);
it('promotes the exact reviewed Ha-4 route with matching owner approval and unchanged audio',()=>{
 const restored=structuredClone(ha);restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
 expect(ha.geometry.review).toEqual({revision:4,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-ha-photo-order-2026-10-07',kind:'projectOwner'});
 expect(ha.audio).toEqual(original.audio);expect(validateLetter(ha)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(ha);expect(eligiblePool(letters,'ready')).toContain(ha);
 for(const factory of Object.values(factories))expect(factory(letters).filter(p=>p.candidate.id==='ha')).toEqual([]);
});
it('preserves Ha-3 history but credits only current student completion in each tracing mode',()=>{
 for(const mode of ['play','guided','precision']){
  const old={profile:'Bunga',letterId:'ha',contentVersion:3,mode,outcome:{play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode],geometryStatus:'approved',audioStatus:'approved',audioVersion:1,preview:false};
  const preview={...old,contentVersion:4,geometryStatus:'pendingReview',preview:true};expect(completedBookLetters(letters,{profile:'Bunga',attempts:[old,preview]},mode).size).toBe(0);
  expect(completedBookLetters(letters,{profile:'Bunga',attempts:[old,preview,{...preview,geometryStatus:'approved',preview:false}]},mode).size).toBe(1);expect(old.contentVersion).toBe(3);expect(preview.preview).toBe(true);
 }
});
