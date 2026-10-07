import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/hamzah-tail-original.json';
import removedYe from '../fixtures/removed-ye.json';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,bookDestination,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool,newMatch} from '../../src/game/matchConfig.js';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
const current=letters.find(l=>l.id==='hamzah');
describe('Approved Hamzah straight tail and removal of Ye',()=>{
 it('keeps the upper curve exact and makes the final route collinear through to the unchanged tail tip',()=>{
  const path=current.geometry.strokes[0].path;
  expect(path.split(' L')[0]).toBe(original.geometry.strokes[0].path.split(' C 520 531.8')[0]);
  for(const p of samplePath('M 621.8 502.1 L 408.4 560.4',2))
   expect(Math.abs((p.x-621.8)*58.3+(p.y-502.1)*213.4)).toBeLessThan(.00001);
  expect(path).toMatch(/L 621\.8 502\.1 L 408\.4 560\.4$/);
  expect(current.contentVersion).toBe(5);expect(validateLetter(current)).toMatchObject({valid:true,ready:true});
  expect(current.geometry.review).toMatchObject({revision:5,date:'2026-10-07',kind:'projectOwner'});
  const stale=structuredClone(current);stale.geometry.review=original.geometry.review;
  expect(validateLetter(stale).ready).toBe(false);
  expect(current.geometry.validSequences).toEqual(original.geometry.validSequences);
  expect(current.audio).toEqual(original.audio);
 });
 it('removes Ye from student/adult books and challenge pools and navigates directly from Ya to Nya',()=>{
  for(const preview of [false,true])expect(eligibleBook(letters,preview).map(l=>l.id)).not.toContain('ye');
  for(const pool of ['ready','pilot','additional'])expect(eligiblePool(letters,pool).map(l=>l.id)).not.toContain('ye');
  const book=eligibleBook(letters);expect(book).toHaveLength(36);
  const ya=book.findIndex(l=>l.id==='ya');expect(book[bookDestination(ya,1,book.length)].id).toBe('nya');
  expect(bookDestination(ya+1,1,book.length)).toBe('end');
  const match=newMatch({pool:'ready',roundCount:36},letters);expect(match.letterIds).not.toContain('ye');
 });
 it('ignores old Ye/Hamzah completions in the current book without deleting old records',()=>{
  for(const mode of ['play','guided','precision']){
   const outcome={play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode];
   const attempts=[original,removedYe].map(l=>({profile:'Bunga',letterId:l.id,contentVersion:l.contentVersion,mode,outcome,geometryStatus:'approved',audioStatus:'approved',preview:false}));
   const saved=JSON.stringify(attempts);expect(completedBookLetters(letters,{profile:'Bunga',attempts},mode).size).toBe(0);
   expect(JSON.stringify(attempts)).toBe(saved);
   attempts.push({...attempts[0],contentVersion:5});expect([...completedBookLetters(letters,{profile:'Bunga',attempts},mode)]).toEqual(['hamzah']);
  }
 });
});
