import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/mim-reference-original.json';
import route from '../fixtures/mim-reference-route.json';
import correction from '../../src/content/mimReferenceShape.json';
import {mimReferenceReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {makeReference} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {createMatcher} from '../../src/tracing/matcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {numberedGuidePlan} from '../../src/tracing/numberedGuides.js';
import {teachingSections,demonstrationPlan} from '../../src/tracing/teachingCues.js';
import {usesModelGlyph} from '../../src/components/LetterModelGlyph.jsx';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
const candidate=mimReferenceReviewCandidates([original])[0].candidate,refs={'stroke-1':makeReference(route.points)};
const before=letters.map(letter=>letter.id==='mim'?original:letter);
const setup=(mode='play',type='mouse')=>(mode==='play'?createPlayMatcher:createMatcher)(candidate,refs,getProfile(mode,type));
function draw(engine,points){engine.start(points[0]);for(const p of points.slice(1))engine.move(p);engine.end(points.at(-1));}
describe('Mim reference-shaped open head and tapered tail',()=>{
 it('isolates Mim 6 and keeps the approved student model, audio and movement policy exact',()=>{
  expect(mimReferenceReviewCandidates(before).map(p=>p.candidate.id)).toEqual(['mim']);expect(before.find(l=>l.id==='mim')).toEqual(original);
  expect(candidate).toMatchObject({contentVersion:6,geometry:{status:'pendingReview',review:null,validSequences:[['stroke-1']],dotTargets:[]}});
  const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths=original.geometry.displayPaths;delete restored.geometry.appearance;expect(restored).toEqual(original);
  expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});expect(validateLetter(original).ready).toBe(true);expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);expect(eligibleBook([candidate],true)).toEqual([candidate]);expect(eligibleBook(letters)).toHaveLength(36);
  expect(mimReferenceReviewCandidates([candidate])).toEqual([]);const pending=structuredClone(original);pending.geometry.status='pendingReview';expect(mimReferenceReviewCandidates([pending])).toEqual([]);
 });
 it('binds the model glyph and measured head/tail cues only to the new revision',()=>{
  expect(usesModelGlyph(candidate)).toBe(true);expect(usesModelGlyph(original)).toBe(false);
  expect(teachingSections(original,'stroke-1')).toEqual([]);expect(teachingSections(candidate,'stroke-1')).toEqual(correction.sections);expect(correction.sections[1][0]).toBeCloseTo(route.headLength/route.length,4);
  const plan=demonstrationPlan(candidate,refs,[],{},false);expect(plan[0].from).toBe(0);expect(plan.at(-1).to).toBe(refs['stroke-1'].length);expect(plan).toHaveLength(2);
  const partial=demonstrationPlan(candidate,refs,'stroke-1',{'stroke-1':90},true);expect(partial[0].from).toBe(90);
 });
 it('places the final guide exactly at the pointed terminal with contiguous offline reveal pieces',()=>{
  const a=candidate.geometry.appearance,part=a.parts[0],guides=numberedGuidePlan(candidate,refs)[0].points;
  expect(a.source).toMatchObject({kind:'referencePhoto',method:'authoredVectorAdaptation',glyph:'م'});expect(part.contours).toHaveLength(1);expect(a.source.font).toBeUndefined();
  expect(guides.map(p=>`${p.number} ${p.label}`)).toEqual(['1 Mula','2 Ikut','3 Siap']);expect(guides.at(-1).anchor).toEqual(a.authoring.routeTail);
  expect(Math.hypot(a.authoring.visibleTailTip.x-a.authoring.routeTail.x,a.authoring.visibleTailTip.y-a.authoring.routeTail.y)).toBeLessThan(.001);
  expect(part.segments[0].from).toBe(0);expect(part.segments.at(-1).to).toBe(route.length);expect(part.segments.length).toBeLessThan(20);for(let i=1;i<part.segments.length;i++)expect(part.segments[i].from).toBe(part.segments[i-1].to);
 });
 it.each([['play','mouse'],['play','touch'],['play','pen'],['guided','mouse'],['guided','touch'],['precision','mouse'],['precision','pen']])('completes the actual head then tail in %s/%s',(mode,type)=>{
  const e=setup(mode,type);draw(e,route.points);expect(e.snapshot().outcome).toBe(`${mode}Complete`);
 });
 it('completes coarse touch/pen sampling and resumes a lifted drag before finishing at the visible tip',()=>{
  for(const type of ['touch','pen'])for(const spacing of [8,24,40]){const e=setup('play',type);draw(e,samplePath(route.path,spacing));expect(e.snapshot().phase,`${type}/${spacing}`).toBe('complete');}
  const e=setup(),split=Math.floor(route.points.length*.8);draw(e,route.points.slice(0,split));expect(e.snapshot().phase).not.toBe('complete');draw(e,route.points.slice(split-1));expect(e.snapshot().phase).toBe('complete');
 });
 it('rejects reversal, start-to-tail shortcuts and direct endpoint jumps',()=>{
  for(const points of [route.points.toReversed(),[route.points[0],...route.points.slice(Math.floor(route.points.length*.62))],[route.points[0],route.points.at(-1)]]){const e=setup();draw(e,points);expect(e.snapshot().phase).not.toBe('complete');}
 });
 it('does not transfer preview credit or accept the previous approval for the new shape',()=>{
  const attempt={profile:'Bunga',letterId:'mim',contentVersion:6,mode:'play',outcome:'playComplete',preview:true,geometryStatus:'pendingReview',audioStatus:'approved'};
  expect(completedBookLetters(letters,{profile:'Bunga',attempts:[attempt]},'play').size).toBe(0);
  const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;expect(validateLetter(stale).ready).toBe(false);
 });
 it('activates the exact reviewed Mim 6 with matching approval and expires its candidate',()=>{
  const active=letters.find(letter=>letter.id==='mim'),restored=structuredClone(active);restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
  expect(active.geometry.review).toMatchObject({revision:6,date:'2026-10-12',kind:'projectOwner',reference:'docs/CONTENT_APPROVALS.md#approval-of-mim-reference-shape-2026-10-12'});
  expect(validateLetter(active)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(active);expect(eligiblePool(letters,'ready')).toContain(active);expect(mimReferenceReviewCandidates(letters)).toEqual([]);
 });
});
