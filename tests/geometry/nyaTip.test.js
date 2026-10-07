import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/nya-tip-original.json';
import correction from '../../src/content/nyaTip.json';
import {nyaTipReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {samplePath,parsePath} from '../../scripts/lib/glyph-geometry.mjs';
// Preserve checks for the prepared review stage; approval has separate checks.
const before=letters.map(letter=>letter.id==='nya'?original:letter);
const [{candidate}]=nyaTipReviewCandidates(before);
const bezier=(p,t)=>({x:(1-t)**3*p[0].x+3*(1-t)**2*t*p[1].x+3*(1-t)*t*t*p[2].x+t**3*p[3].x,y:(1-t)**3*p[0].y+3*(1-t)**2*t*p[1].y+3*(1-t)*t*t*p[2].y+t**3*p[3].y});
describe('Nya shortened upper-right tip',()=>{
 it('removes the upper stub while retaining the exact remaining cubic curve and entire bowl',()=>{
  const parts=parsePath(correction.path);const points=[{x:608.34011,y:417},{x:618.34592,y:465.29744},{x:649.26781,y:513.61386},{x:613,y:558.1}];
  const old=[{x:605.8,y:399.7},{x:610,y:453.7},{x:653.6,y:508.3},{x:613,y:558.1}];
  for(let n=0;n<=100;n++){
   const u=n/100,a=bezier(points,u),b=bezier(old,correction.retainedCurveFraction+(1-correction.retainedCurveFraction)*u);
   expect(Math.hypot(a.x-b.x,a.y-b.y)).toBeLessThan(.00002);
  }
  expect(parts.length).toBe(2);
  const path=candidate.geometry.strokes[0].path;
  expect(path.slice(path.indexOf(' C 511.3'))).toBe(original.geometry.strokes[0].path.slice(original.geometry.strokes[0].path.indexOf(' C 511.3')));
  const samples=samplePath(path,1);expect(samples[0].y-candidate.geometry.strokes[0].displayWidth/2).toBe(393);
  expect(samples.at(-1)).toEqual({x:366.6,y:451.4});
 });
 it('retains identity, dots, order, audio and all route settings except the shorter path',()=>{
  const restored=structuredClone(candidate);restored.contentVersion=3;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
  restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths=original.geometry.displayPaths;
  expect(restored).toEqual(original);expect(candidate.geometry.validSequences).toEqual([['stroke-1','dot-1','dot-2','dot-3']]);
  expect(candidate.audio).toEqual(original.audio);expect(before.find(l=>l.id==='nya')).toEqual(original);
 });
 it('isolates revision 4 in adult review, leaving all 36 approved lessons intact and rejecting stale approval',()=>{
  expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});expect(candidate.geometry.review).toBeNull();
  expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);expect(eligibleBook([candidate],true)).toEqual([candidate]);
  expect(eligibleBook(letters)).toHaveLength(36);expect(nyaTipReviewCandidates([candidate])).toEqual([]);
  const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;
  expect(validateLetter(stale)).toMatchObject({valid:false,ready:false});
 });
});
