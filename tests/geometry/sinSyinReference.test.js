import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/sin-syin-reference-originals.json';
import route from '../fixtures/sin-syin-reference-route.json';
import {sinSyinReferenceReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {makeReference} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {createMatcher} from '../../src/tracing/matcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {numberedGuidePlan} from '../../src/tracing/numberedGuides.js';
import {outlineAppearance} from '../../src/tracing/outlineAppearance.js';
const before=letters.map(letter=>originals.find(original=>original.id===letter.id)||letter);
const proposals=sinSyinReferenceReviewCandidates(before),refs={'stroke-1':makeReference(route.points)};
const setup=(candidate,mode='play',type='mouse')=>(mode==='play'?createPlayMatcher:createMatcher)(candidate,refs,getProfile(mode,type));
function draw(e,points){e.start(points[0]);points.slice(1).forEach(p=>e.move(p));return e.end(points.at(-1));}
describe('Sin / Syin reference-photo bodies',()=>{
 it('keeps the active catalogue exact and isolates only Sin 3 / Syin 4 with unchanged dots and audio',()=>{
  expect(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion])).toEqual([['sin',3],['syin',4]]);
  for(const {original,candidate}of proposals){expect(original).toEqual(originals.find(l=>l.id===original.id));const restored=structuredClone(candidate);
   restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths=original.geometry.displayPaths;delete restored.geometry.appearance;expect(restored).toEqual(original);
   expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});expect(candidate.geometry.review).toBeNull();expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);expect(eligibleBook([candidate],true)).toEqual([candidate]);expect(sinSyinReferenceReviewCandidates([candidate])).toEqual([]);
   const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;expect(validateLetter(stale).ready).toBe(false);
  }
  expect(eligibleBook(letters)).toHaveLength(36);
 });
 it('uses the same adapted body, puts the visible terminal at reference height and guides the real endpoint',()=>{
  expect(proposals[0].candidate.geometry.strokes[0].path).toBe(proposals[1].candidate.geometry.strokes[0].path);
  expect(proposals[0].candidate.geometry.appearance.parts[0]).toEqual(proposals[1].candidate.geometry.appearance.parts[0]);
  for(const {candidate}of proposals){const a=outlineAppearance(candidate),guide=numberedGuidePlan(candidate,refs),auth=a.authoring;
   expect(a.kind).toBe('referenceOutline');expect(a.source).toMatchObject({kind:'referencePhoto',method:'authoredVectorAdaptation'});expect(a.source.font).toBeUndefined();
   expect(Math.abs(auth.visibleTailTip.y-auth.referenceLevel)).toBeLessThan(.1);expect(auth.visibleTailTip.y-a.parts[0].bounds.y).toBeGreaterThan(140);
   expect(Math.hypot(auth.visibleTailTip.x-auth.routeTail.x,auth.visibleTailTip.y-auth.routeTail.y)).toBeLessThan(5);
   expect(guide[0].points.map(p=>p.number)).toEqual([1,2,3]);expect(guide[0].points.at(-1).anchor).toEqual(auth.routeTail);
   expect(guide.slice(1).map(p=>p.points[0].number)).toEqual(candidate.id==='syin'?[4,5,6]:[]);
   const segments=a.parts[0].segments;expect(segments[0].from).toBe(0);expect(segments.at(-1).to).toBe(route.length);expect(segments).toHaveLength(27);
  }
 });
 it('validates explicit photo provenance and rejects unsafe/missing data and stale geometry approval',()=>{
  const fail=edit=>{const c=structuredClone(proposals[0].candidate);edit(c.geometry.appearance);expect(validateLetter(c).valid).toBe(false);};
  fail(a=>a.kind='unknown');fail(a=>a.source.sha256='fake');fail(a=>a.source.kind='font');fail(a=>a.source.method='highResolutionInkContours');fail(a=>a.source.image='../image.png');fail(a=>a.source.reference='https://example.com');fail(a=>a.source.maxContourError=1);fail(a=>a.parts[0].segments[1].from+=2);fail(a=>a.parts[0].contours=['M0 0 L1 1']);
 });
 it.each([['play','mouse'],['play','touch'],['guided','mouse'],['guided','touch'],['precision','mouse'],['precision','touch']])('completes a continuous %s/%s body and requires every separate Syin dot',(mode,type)=>{
  for(const {candidate}of proposals){const e=setup(candidate,mode,type);draw(e,route.points);expect(e.snapshot().completed).toContain('stroke-1');
   for(const dot of candidate.geometry.dotTargets){expect(e.snapshot().outcome).toBeNull();e.start(dot);e.end(dot);}
   expect(e.snapshot().outcome).toBe(`${mode}Complete`);
  }
 });
 it('rejects reversal, bowl-only and endpoint jumps; real forward tracing recovers after an early lift',()=>{
  for(const {candidate}of proposals){for(const points of [route.points.toReversed(),route.points.slice(Math.floor(route.points.length*.6)),[route.points[0],route.points.at(-1)]]){const e=setup(candidate);draw(e,points);expect(e.snapshot().completed).not.toContain('stroke-1');}
   const e=setup(candidate),split=Math.floor(route.points.length*.4);draw(e,route.points.slice(0,split));expect(e.snapshot().completed).not.toContain('stroke-1');draw(e,route.points.slice(split-1));expect(e.snapshot().completed).toContain('stroke-1');
  }
 });
 it('preserves historical attempts without crediting old or preview work to new shapes',()=>{
  const attempts=originals.map(l=>({profile:'Bunga',preview:false,letterId:l.id,contentVersion:l.contentVersion,geometryStatus:'approved',audioStatus:'approved',mode:'play',outcome:'playComplete'})),pending=proposals.map(({candidate},i)=>({...attempts[i],contentVersion:candidate.contentVersion,preview:true,geometryStatus:'pendingReview'}));
  expect(completedBookLetters(before,{profile:'Bunga',attempts:[...attempts,...pending]},'play').size).toBe(2);expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,...pending]},'play').size).toBe(0);
 });
 it('activates the exact reviewed shapes with matching approval and expires their proposals',()=>{
  expect(sinSyinReferenceReviewCandidates(letters)).toEqual([]);
  for(const {candidate}of proposals){const active=letters.find(letter=>letter.id===candidate.id),restored=structuredClone(active);restored.geometry.status='pendingReview';restored.geometry.review=null;
   expect(restored).toEqual(candidate);expect(active.geometry.review).toMatchObject({revision:candidate.contentVersion,date:'2026-10-12',kind:'projectOwner'});
   expect(validateLetter(active)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(active);expect(eligiblePool(letters,'ready')).toContain(active);
  }
 });
});
