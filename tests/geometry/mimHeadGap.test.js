import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import previous from '../fixtures/mim-video-original.json';
import videoOriginals from '../fixtures/video-review-originals.json';
import {videoReviewCandidates} from '../../src/content/reviewCandidates.js';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {playGuideWidth} from '../../src/content/displayWidth.js';
const {candidate}=videoReviewCandidates(letters.map(letter=>videoOriginals.find(original=>original.id===letter.id)||letter)).find(p=>p.candidate.id==='mim');
describe('Mim tiny opening on the left of the head',()=>{
 it('narrows the head opening without closing it and preserves the connected tail exactly',()=>{
  const path=candidate.geometry.strokes[0].path,original=previous.original.geometry.strokes[0].path;
  expect(path.endsWith(original.replace(/^M\s*[-\d.]+\s+[-\d.]+\s*/,''))).toBe(true);
  const start=samplePath(path,1)[0];
  const returning=samplePath('M 633.3 566.9 C 622.9 582.4 482.9 569.9 444.1 608.7 C 437 611.1 435.5 624.4 435.2 630.7',.5);
  const distance=Math.min(...returning.map(p=>Math.hypot(p.x-start.x,p.y-start.y)));
  const guideGap=distance-playGuideWidth(candidate.geometry.strokes[0]);
  expect(guideGap).toBeGreaterThan(4);expect(guideGap).toBeLessThan(7);
  expect(distance-candidate.geometry.strokes[0].width).toBeGreaterThan(10);
  expect(samplePath(path,1).at(-1)).toEqual({x:436.4,y:843});
 });
 it('promotes the exact corrected gap with matching approval and unchanged audio',()=>{
  expect(candidate.contentVersion).toBe(5);expect(candidate.geometry).toMatchObject({status:'pendingReview',review:null,validSequences:[['stroke-1']],dotTargets:[]});
  expect(candidate.geometry.strokes).toHaveLength(1);expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
  const approved=structuredClone(letters.find(l=>l.id==='mim'));
  expect(validateLetter(approved)).toMatchObject({valid:true,ready:true});
  expect(approved.geometry.review).toMatchObject({revision:5,kind:'projectOwner'});
  approved.geometry.status='pendingReview';approved.geometry.review=null;expect(approved).toEqual(candidate);
  expect(candidate.audio).toEqual(previous.original.audio);
  const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review={...previous.original.geometry.review,revision:4};
  expect(validateLetter(stale)).toMatchObject({valid:false,ready:false});
 });
 it('completes the real one-stroke route with coarse touch/pen and rejects skipping to the nearby return',()=>{
  const stroke=candidate.geometry.strokes[0],points=samplePath(stroke.path,1),refs={'stroke-1':makeReference(points)};
  for(const type of ['touch','pen'])for(const spacing of [4,24,40]){
   const engine=createPlayMatcher(candidate,refs,getProfile('play',type)),route=samplePath(stroke.path,spacing);
   engine.start(route[0]);for(const p of route.slice(1))engine.move(p);engine.end(route.at(-1));expect(engine.snapshot().phase,type+' '+spacing).toBe('complete');
  }
  const attack=createPlayMatcher(candidate,refs,getProfile('play','touch'));
  attack.start(points[0]);for(const p of samplePath('M 444.1 608.7 C 437 611.1 435.5 624.4 435.2 630.7 C 432.4 683.2 451.4 736.5 452.7 789.1 C 453.3 808.9 436.4 823.9 436.4 843',4))attack.move(p);
  attack.end({x:436.4,y:843});expect(attack.snapshot().phase).not.toBe('complete');
 });
});
