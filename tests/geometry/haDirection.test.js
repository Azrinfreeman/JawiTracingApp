import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import correction from '../../src/content/haDirection.json';
import haOriginal from '../fixtures/ha-direction-original.json';
import * as factories from '../../src/content/reviewCandidates.js';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference,pointAt} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {teachingSections,demonstrationPlan,stageInstruction} from '../../src/tracing/teachingCues.js';
const before=letters.map(letter=>letter.id==='ha'?haOriginal:letter);
const [{original,candidate}]=factories.haDirectionReviewCandidates(before);
const reference=makeReference(samplePath(correction.path,.2)),references={'stroke-1':reference};
describe('Ha outer-loop-first photo route',()=>{
 it('traverses top, outer right loop, left loop, inner downstroke and left tail continuously',()=>{
  const point=f=>pointAt(reference,f*reference.length);
  expect(point(0)).toEqual({x:501.3,y:409.5});
  expect(point(.24).x).toBeGreaterThan(635); // Right loop before the left loop.
  expect(point(.55).x).toBeLessThan(470); // Rise around left loop.
  expect(point(.75).y).toBeGreaterThan(point(.69).y); // Inner downstroke after both loops.
  expect(point(.95).x).toBeLessThan(point(.85).x); // Finish left along tail.
  expect(point(1)).toEqual({x:327.5,y:645});
  expect(candidate.geometry.strokes).toHaveLength(1);expect(candidate.geometry.strokes[0].penLiftPolicy).toBe('continuous');
  expect(candidate.geometry.validSequences).toEqual([['stroke-1']]);expect(candidate.geometry.dotTargets).toEqual([]);
 });
 it('preserves catalogue, audio and all geometry properties other than the reviewed route',()=>{
  const restored=structuredClone(candidate);restored.contentVersion=3;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
  restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths=original.geometry.displayPaths;
  expect(restored).toEqual(original);expect(candidate.audio).toEqual(original.audio);
  expect(letters.every(letter=>validateLetter(letter).ready)).toBe(true);
  // Historical Ha stage excludes the later, separately gated Nya proposal.
  expect(Object.entries(factories).filter(([name])=>!['nyaTipReviewCandidates','sadDadReviewCandidates'].includes(name)).flatMap(([,factory])=>factory(before)).map(p=>p.candidate.id)).toEqual(['ha']);
 });
 it('requires approval of revision 4 and keeps the approved student model at revision 3',()=>{
  expect(candidate).toMatchObject({contentVersion:4,geometry:{status:'pendingReview',review:null}});
  expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
  expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);
  const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;expect(validateLetter(stale).valid).toBe(false);
  expect(factories.haDirectionReviewCandidates([candidate])).toEqual([]);expect(original.contentVersion).toBe(3);
 });
 it('uses five ordered cues and demonstration pauses while retaining original revision cues',()=>{
  expect(teachingSections(original,'stroke-1')[0][1]).toBe('Ikut gelung kecil dahulu.');
  expect(teachingSections(candidate,'stroke-1')).toHaveLength(5);
  const plan=demonstrationPlan(candidate,references,null,{});expect(plan).toHaveLength(5);
  expect(plan.every(step=>step.id==='stroke-1'&&step.pause===450)).toBe(true);
  expect(plan[0].from).toBe(0);expect(plan.at(-1).to).toBe(reference.length);
  for(let i=1;i<plan.length;i++)expect(plan[i].from).toBe(plan[i-1].to);
  const part={kind:'stroke',id:'stroke-1',points:[{number:1}],reference};
  expect(stageInstruction(candidate,part,{phase:'awaitingStart',completed:[],progress:{}})).toBe('Mula di 1. Turun dari hujung atas.');
  for(const [f,text]of correction.sections)expect(stageInstruction(candidate,part,{phase:'tracing',completed:[],progress:{'stroke-1':(f+.0001)*reference.length}})).toBe(text);
 });
 it('accepts complete mouse, touch and pen paths through both crossings at fine and coarse spacing',()=>{
  for(const type of ['mouse','touch','pen'])for(const spacing of [4,24,40]){
   const engine=createPlayMatcher(candidate,references,getProfile('play',type)),route=samplePath(correction.path,spacing);
   engine.start(route[0]);for(const p of route.slice(1))engine.move(p);engine.end(route.at(-1));
   expect(engine.snapshot().phase,`${type} ${spacing}`).toBe('complete');
  }
 });
 it('rejects the former inner-first route, tail-first and reversed tracing',()=>{
  for(const route of [samplePath(original.geometry.strokes[0].path,4),samplePath(correction.path,4).reverse(),samplePath(correction.path,4).slice(-50)]){
   const engine=createPlayMatcher(candidate,references,getProfile('play','touch'));
   engine.start(route[0]);for(const p of route.slice(1))engine.move(p);engine.end(route.at(-1));expect(engine.snapshot().phase).not.toBe('complete');
  }
 });
});
