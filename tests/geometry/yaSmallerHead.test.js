import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import original from '../fixtures/ya-smaller-head-original.json';
import correction from '../../src/content/yaSmallerHead.json';
import {yaSmallerHeadReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {makeReference} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {createMatcher} from '../../src/tracing/matcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {numberedGuidePlan} from '../../src/tracing/numberedGuides.js';
import {teachingSections,demonstrationPlan} from '../../src/tracing/teachingCues.js';
import {fitTraceViewport} from '../../src/game/screenLayout.js';
import {usesModelGlyph} from '../../src/components/LetterModelGlyph.jsx';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
const candidate=yaSmallerHeadReviewCandidates([original])[0].candidate,route=samplePath(correction.path,3),refs={'stroke-1':makeReference(samplePath(correction.path,.3))};
const before=letters.map(letter=>letter.id==='ya'?original:letter);
const setup=(mode='play',type='mouse')=>(mode==='play'?createPlayMatcher:createMatcher)(candidate,refs,getProfile(mode,type));
function draw(engine,points){engine.start(points[0]);for(const p of points.slice(1))engine.move(p);engine.end(points.at(-1));}
describe('Ya: smaller reference head',()=>{
 it('keeps the current approved catalogue exact and isolates revision 3 from student/scored pools',()=>{
  expect(before.find(l=>l.id==='ya')).toEqual(original);expect(yaSmallerHeadReviewCandidates(before)).toHaveLength(1);
  const restored=structuredClone(candidate);restored.contentVersion=2;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths=original.geometry.displayPaths;expect(restored).toEqual(original);
  expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);expect(eligibleBook([candidate],true)).toEqual([candidate]);expect(eligibleBook(letters)).toHaveLength(36);
  expect(yaSmallerHeadReviewCandidates([candidate])).toEqual([]);const pending=structuredClone(original);pending.geometry.status='pendingReview';expect(yaSmallerHeadReviewCandidates([pending])).toEqual([]);
 });
 it('shrinks only the first two cubic curves around their fixed bowl junction',()=>{
  const numbers=p=>p.match(/[-+]?(?:\d*\.)?\d+/g).map(Number),old=numbers(correction.oldHead),head=numbers(correction.headPath);
  expect(correction.factor).toBe(.72);expect(head).toHaveLength(old.length);for(let i=0;i<head.length;i++){const anchor=i%2?correction.junction.y:correction.junction.x;expect(head[i]).toBeCloseTo(anchor+(old[i]-anchor)*.72,4);}
  const oldBowl=original.geometry.strokes[0].path.match(/[MC][^MC]+/g).slice(3).join(' ');expect(numbers(correction.bowlPath)).toEqual(numbers(oldBowl));expect(candidate.geometry.strokes[0].path.endsWith(correction.bowlPath)).toBe(true);expect(head.slice(-2)).toEqual([627.2,632.5]);
  // The tangent at the join is scaled by the same positive factor: no kink.
  expect((head.at(-2)-head.at(-4))/(old.at(-2)-old.at(-4))).toBeCloseTo(.72,4);expect((head.at(-1)-head.at(-3))/(old.at(-1)-old.at(-3))).toBeCloseTo(.72,4);
 });
 it('preserves scale, lower bowl, dot positions and touch policies in every viewport',()=>{
  expect(candidate.geometry.dotTargets).toEqual(original.geometry.dotTargets);expect(candidate.geometry.validSequences).toEqual([['stroke-1','dot-1','dot-2']]);expect(candidate.audio).toEqual(original.audio);
  const oldRefs={'stroke-1':makeReference(samplePath(original.geometry.strokes[0].path,.3))};for(const [w,h]of [[320,740],[768,1024],[1024,768],[1280,800]]){const a=fitTraceViewport(original,oldRefs,w,h),b=fitTraceViewport(candidate,refs,w,h);for(const key of ['x','y','width','height'])expect(b[key]).toBeCloseTo(a[key],3);}
  expect(usesModelGlyph(candidate)).toBe(true);expect(usesModelGlyph(original)).toBe(false);
 });
 it('binds instructions, numbered dots and demonstrations to the new route',()=>{
  const guides=numberedGuidePlan(candidate,refs);expect(guides[0].points.map(p=>[p.number,p.label])).toEqual([[1,'Mula'],[2,'Ikut'],[3,'Henti']]);expect(guides.slice(1).map(p=>[p.points[0].number,p.points[0].label,p.points[0].anchor])).toEqual([[4,'Titik',{x:411,y:807}],[5,'Titik akhir',{x:510,y:797}]]);
  expect(teachingSections(original,'stroke-1')).toEqual([]);expect(teachingSections(candidate,'stroke-1')).toEqual(correction.sections);expect(correction.sections[1][0]*refs['stroke-1'].length).toBeCloseTo(correction.headLength,1);
  const plan=demonstrationPlan(candidate,refs,null,{});expect(plan.map(p=>p.id)).toEqual(['stroke-1','stroke-1','dot-1','dot-2']);expect(plan[1].to).toBe(refs['stroke-1'].length);
 });
 it.each(['play','guided','precision'])('completes %s with mouse, touch and pen only after two separate final taps',mode=>{
  for(const type of ['mouse','touch','pen']){const e=setup(mode,type);draw(e,route);expect(e.snapshot().completed).toContain('stroke-1');expect(e.snapshot().phase).not.toBe('complete');draw(e,[candidate.geometry.dotTargets[0]]);expect(e.snapshot().phase).not.toBe('complete');draw(e,[candidate.geometry.dotTargets[1]]);expect(e.snapshot().outcome).toBe(`${mode}Complete`);}
 });
 it('rejects reversals and endpoint jumps; resumes lifted tracing around the smaller head',()=>{
  for(const points of [route.toReversed(),[route[0],route.at(-1)]]){const e=setup();draw(e,points);expect(e.snapshot().completed).not.toContain('stroke-1');}
  const e=setup(),split=Math.floor(route.length*.25);draw(e,route.slice(0,split));expect(e.snapshot().completed).not.toContain('stroke-1');draw(e,route.slice(split-1));expect(e.snapshot().completed).toContain('stroke-1');
  for(const spacing of [8,24,40]){const coarse=setup('play','touch');draw(coarse,samplePath(correction.path,spacing));expect(coarse.snapshot().completed).toContain('stroke-1');}
 });
 it('rejects stale approval and prevents preview credit transfer',()=>{
  const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;expect(validateLetter(stale).ready).toBe(false);
  const attempt={profile:'Bunga',letterId:'ya',contentVersion:3,mode:'play',outcome:'playComplete',preview:true,geometryStatus:'pendingReview',audioStatus:'approved'};expect(completedBookLetters(letters,{profile:'Bunga',attempts:[attempt]},'play').size).toBe(0);
 });
 it('activates the exact reviewed Ya 3 with matching approval and expires its proposal',()=>{
  const active=letters.find(letter=>letter.id==='ya'),restored=structuredClone(active);restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
  expect(active.geometry.review).toMatchObject({revision:3,date:'2026-10-12',kind:'projectOwner',reference:'docs/CONTENT_APPROVALS.md#approval-of-ya-smaller-head-2026-10-12'});expect(validateLetter(active)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(active);expect(eligiblePool(letters,'ready')).toContain(active);expect(yaSmallerHeadReviewCandidates(letters)).toEqual([]);
 });
});
