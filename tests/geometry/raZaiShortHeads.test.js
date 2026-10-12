import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/ra-zai-short-head-originals.json';
import routes from '../fixtures/ra-zai-short-head-routes.json';
import {raZaiShortHeadReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {makeReference} from '../../src/tracing/geometry.js';
import {numberedGuidePlan} from '../../src/tracing/numberedGuides.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
const before=letters.map(letter=>originals.find(original=>original.id===letter.id)||letter);
const proposals=raZaiShortHeadReviewCandidates(before);
const numbers=path=>path.match(/[-+]?(?:\d*\.)?\d+/g).map(Number);
const bezier=(p,t)=>({x:(1-t)**3*p[0]+3*(1-t)**2*t*p[2]+3*(1-t)*t*t*p[4]+t**3*p[6],y:(1-t)**3*p[1]+3*(1-t)**2*t*p[3]+3*(1-t)*t*t*p[5]+t**3*p[7]});
const engine=(candidate,pointerType='mouse')=>createPlayMatcher(candidate,{'stroke-1':makeReference(routes[candidate.id].points)},getProfile('play',pointerType));
function draw(e,points){e.start(points[0]);points.slice(1).forEach(p=>e.move(p));return e.end(points.at(-1));}
describe('Ra / Zai shorter head review',()=>{
 it('isolates only Ra 4 and Zai 5 without modifying the approved catalogue or recordings',()=>{
  expect(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion])).toEqual([['ra',4],['zai',5]]);
  for(const {original,candidate} of proposals){
   expect(original).toEqual(originals.find(l=>l.id===original.id));expect(candidate.audio).toEqual(original.audio);
   const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
   restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths=original.geometry.displayPaths;restored.geometry.appearance=original.geometry.appearance;
   expect(restored).toEqual(original);expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
   expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);expect(eligibleBook([candidate],true)).toEqual([candidate]);
   expect(raZaiShortHeadReviewCandidates([candidate])).toEqual([]);
   const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;expect(validateLetter(stale).ready).toBe(false);
  }
  expect(eligibleBook(letters)).toHaveLength(36);
 });
 it('retains the exact cubic remainder and all following curves without shrinking the letter',()=>{
  for(const {original,candidate} of proposals){
   const old=original.geometry.strokes[0].path,path=candidate.geometry.strokes[0].path,t=candidate.geometry.appearance.authoring.retainedCurveFraction;
   for(let n=0;n<=50;n++){const a=bezier(numbers(path),n/50),b=bezier(numbers(old),t+(1-t)*n/50);expect(Math.hypot(a.x-b.x,a.y-b.y)).toBeLessThan(.00002);}
   expect(path.slice(path.indexOf(' C',path.indexOf(' C')+2))).toBe(old.slice(old.indexOf(' C',old.indexOf(' C')+2)));
   expect(numbers(path)[1]-numbers(old)[1]).toBeGreaterThan(120);
   const outline=candidate.geometry.appearance.parts[0],oldOutline=original.geometry.appearance.parts[0];
   expect(outline.bounds.x).toBe(oldOutline.bounds.x);expect(outline.bounds.width).toBe(oldOutline.bounds.width);
   expect(outline.bounds.y+outline.bounds.height).toBeCloseTo(oldOutline.bounds.y+oldOutline.bounds.height,4);
   const oldPoints=numbers(oldOutline.contours[0]),newPoints=numbers(outline.contours[0]);
   for(let i=0;i<oldPoints.length;i+=2)if(oldPoints[i+1]>550)expect(newPoints.some((x,j)=>j%2===0&&x===oldPoints[i]&&newPoints[j+1]===oldPoints[i+1])).toBe(true);
   expect(candidate.geometry.appearance.source).toEqual(original.geometry.appearance.source);
  }
 });
 it('retains the Zai dot and assigns guides from the new cap through the existing tail',()=>{
  for(const {original,candidate} of proposals){
   expect(candidate.geometry.dotTargets).toEqual(original.geometry.dotTargets);
   expect(candidate.geometry.appearance.parts.slice(1)).toEqual(original.geometry.appearance.parts.slice(1));
   const ref=makeReference(routes[candidate.id].points),plan=numberedGuidePlan(candidate,{'stroke-1':ref});
   expect(plan[0].points.map(p=>p.number)).toEqual([1,2,3]);expect(plan[0].points[0].anchor).toMatchObject(routes[candidate.id].points[0]);
   if(candidate.id==='zai')expect(plan[1]).toMatchObject({id:'dot-1',points:[{number:4,anchor:{x:547,y:293}}]});
   const segments=candidate.geometry.appearance.parts[0].segments;expect(segments[0].from).toBe(0);expect(segments.at(-1).to).toBeCloseTo(routes[candidate.id].length,5);
  }
 });
 it.each(['mouse','touch'])('accepts the shortened route with %s and requires the separate Zai dot',pointerType=>{
  for(const {candidate} of proposals){const e=engine(candidate,pointerType),points=routes[candidate.id].points,result=draw(e,points);expect(result.completed).toContain('stroke-1');
   if(candidate.id==='zai'){expect(result.outcome).toBeNull();expect(result.pending).toEqual(['dot-1']);const dot=candidate.geometry.dotTargets[0];e.start(dot);expect(e.end(dot).outcome).toBe('playComplete');}
   else expect(result.outcome).toBe('playComplete');
  }
 });
 it('rejects tail-only, reverse and endpoint shortcuts; genuine forward tracing can recover',()=>{
  for(const {candidate} of proposals){const points=routes[candidate.id].points;
   for(const bad of [points.toReversed(),points.slice(Math.floor(points.length*.65)),[points[0],points.at(-1)]]){const e=engine(candidate);draw(e,bad);expect(e.snapshot().completed).not.toContain('stroke-1');}
   const e=engine(candidate),split=Math.floor(points.length*.35);draw(e,points.slice(0,split));expect(e.snapshot().completed).not.toContain('stroke-1');
   draw(e,points.slice(split-1));expect(e.snapshot().completed).toContain('stroke-1');
  }
 });
 it('preserves historical attempts without crediting old or preview completions to the new shapes',()=>{
  const attempts=originals.map(l=>({profile:'Bunga',preview:false,letterId:l.id,contentVersion:l.contentVersion,geometryStatus:'approved',audioStatus:'approved',mode:'play',outcome:'playComplete'}));
  const preview=proposals.map(({candidate},i)=>({...attempts[i],preview:true,contentVersion:candidate.contentVersion,geometryStatus:'pendingReview'}));
  expect(completedBookLetters(before,{profile:'Bunga',attempts:[...attempts,...preview]},'play').size).toBe(2);
  expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,...preview]},'play').size).toBe(0);
  expect(completedBookLetters(proposals.map(p=>p.candidate),{profile:'Bunga',attempts:preview},'play').size).toBe(0);
 });
 it('activates only the exact approved candidates and expires their adult proposal cards',()=>{
  expect(raZaiShortHeadReviewCandidates(letters)).toEqual([]);
  for(const {candidate} of proposals){const active=letters.find(l=>l.id===candidate.id),restored=structuredClone(active);restored.geometry.status='pendingReview';restored.geometry.review=null;
   expect(restored).toEqual(candidate);expect(active.geometry.review).toMatchObject({revision:candidate.contentVersion,date:'2026-10-11',kind:'projectOwner'});
   expect(validateLetter(active)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(active);expect(eligiblePool(letters,'ready')).toContain(active);
  }
 });
});
