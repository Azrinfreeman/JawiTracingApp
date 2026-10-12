import {describe,it,expect} from 'vitest';
import currentLetters from '../../src/content/letters.json';
import approvedDirectionModels from '../fixtures/wau-va-smaller-head-originals.json';
import originals from '../fixtures/wau-va-direction-originals.json';
import {wauVaReviewCandidates} from '../../src/content/reviewCandidates.js';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference,pointAt} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {teachingSections,demonstrationPlan,stageInstruction} from '../../src/tracing/teachingCues.js';
// Retain the October-7 direction-approval contract after the later head-size approval.
const letters=currentLetters.map(l=>approvedDirectionModels.find(original=>original.id===l.id)||l);
const candidates=wauVaReviewCandidates(originals);
describe('Wau and Va left-first head routes',()=>{
 it('reverses the exact head curves while preserving the tail and all other content',()=>{
  expect(candidates.map(p=>[p.candidate.id,p.candidate.contentVersion])).toEqual([['wau',3],['va',4]]);
  for(const {original,candidate}of candidates){
   const originalCurves=original.geometry.strokes[0].path.split(' C '), revised=candidate.geometry.strokes[0].path.split(' C ');
   expect(revised.slice(3)).toEqual(originalCurves.slice(3));
   const reference=makeReference(samplePath(candidate.geometry.strokes[0].path,.2));
   expect(pointAt(reference,15).x).toBeLessThan(pointAt(reference,0).x);
   expect(pointAt(reference,15).y).toBeGreaterThan(pointAt(reference,0).y);
   expect(pointAt(reference,reference.length)).toEqual(samplePath(original.geometry.strokes[0].path,1).at(-1));
   const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;
   restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
   restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths=original.geometry.displayPaths;
   expect(restored).toEqual(original);expect(candidate.geometry.strokes).toHaveLength(1);
   expect(candidate.geometry.strokes[0].penLiftPolicy).toBe('continuous');
  }
 });
 it('gates the new revisions, refuses stale approvals and never changes the active catalogue',()=>{
  const before=JSON.stringify(letters);
  for(const {original,candidate}of candidates){
   expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
   expect(candidate.geometry).toMatchObject({status:'pendingReview',review:null});
   expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);
   const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;
   expect(validateLetter(stale).valid).toBe(false);
  }
  wauVaReviewCandidates(letters);expect(JSON.stringify(letters)).toBe(before);
  expect(wauVaReviewCandidates(candidates.map(p=>p.candidate))).toEqual([]);
 });
 it('cues and demonstrates the left-first head, continuous tail, then Va dot',()=>{
  for(const {candidate}of candidates){
   const reference=makeReference(samplePath(candidate.geometry.strokes[0].path,.2));
   const part={kind:'stroke',id:'stroke-1',points:[{number:1}],reference};
   expect(stageInstruction(candidate,part,{phase:'awaitingStart',completed:[],progress:{}})).toBe('Mula di 1. Ke kiri, kemudian naik mengikut gelung.');
   expect(teachingSections(candidate,'stroke-1').at(-1)[1]).toBe('Teruskan ekor ke kiri.');
   const plan=demonstrationPlan(candidate,{'stroke-1':reference},null,{});
   expect(plan.map(p=>p.id)).toEqual(candidate.id==='va'?['stroke-1','stroke-1','dot-1']:['stroke-1','stroke-1']);
   expect(plan[1].from).toBe(plan[0].to);expect(plan[1].to).toBe(reference.length);
  }
 });
 it('accepts fine and coarse complete routes for mouse, touch and pen, with dots last',()=>{
  for(const {candidate}of candidates)for(const type of ['mouse','touch','pen'])for(const spacing of [4,24,40]){
   const refs={'stroke-1':makeReference(samplePath(candidate.geometry.strokes[0].path,.2))};
   const engine=createPlayMatcher(candidate,refs,getProfile('play',type)),route=samplePath(candidate.geometry.strokes[0].path,spacing);
   engine.start(route[0]);for(const p of route.slice(1))engine.move(p);engine.end(route.at(-1));
   if(candidate.id==='va')expect(engine.snapshot().phase).not.toBe('complete');
   for(const dot of candidate.geometry.dotTargets){engine.start(dot);engine.end(dot);}
   expect(engine.snapshot().phase,`${candidate.id} ${type} ${spacing}`).toBe('complete');
  }
 });
 it('rejects the previous upward-first route, reversed tracing and a tail shortcut',()=>{
  for(const {original,candidate}of candidates){
   const refs={'stroke-1':makeReference(samplePath(candidate.geometry.strokes[0].path,.2))};
   for(const route of [samplePath(original.geometry.strokes[0].path,4),samplePath(candidate.geometry.strokes[0].path,4).reverse(),samplePath(candidate.geometry.strokes[0].path,4).slice(-30)]){
    const engine=createPlayMatcher(candidate,refs,getProfile('play','touch'));
    engine.start(route[0]);for(const p of route.slice(1))engine.move(p);engine.end(route.at(-1));
    for(const dot of candidate.geometry.dotTargets){engine.start(dot);engine.end(dot);}
    expect(engine.snapshot().phase).not.toBe('complete');
   }
  }
 });
 it('promotes the exact reviewed routes and expires all adult proposals',()=>{
  for(const {original,candidate}of candidates){
   const current=letters.find(letter=>letter.id===candidate.id),restored=structuredClone(current);
   restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
   expect(current.geometry.review).toEqual({revision:candidate.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-07',reference:'docs/CONTENT_APPROVALS.md#approval-of-wau-and-va-left-first-routes-2026-10-07',kind:'projectOwner'});
   expect(validateLetter(current)).toMatchObject({valid:true,ready:true});
   expect(eligibleBook(letters)).toContain(current);expect(eligiblePool(letters,'ready')).toContain(current);
   expect(current.audio).toEqual(original.audio);
  }
  expect(wauVaReviewCandidates(letters)).toEqual([]);
 });
 it('keeps old and adult preview attempts without awarding current student credit',()=>{
  for(const {original,candidate}of candidates)for(const mode of ['play','guided','precision']){
   const base={profile:'Bunga',letterId:candidate.id,mode,outcome:{play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode],geometryStatus:'approved',audioStatus:'approved',preview:false};
   const attempts=[{...base,contentVersion:original.contentVersion},{...base,contentVersion:candidate.contentVersion,geometryStatus:'pendingReview',preview:true}],saved=JSON.stringify(attempts);
   expect(completedBookLetters(letters,{profile:'Bunga',attempts},mode).has(candidate.id)).toBe(false);expect(JSON.stringify(attempts)).toBe(saved);
   expect(completedBookLetters(letters,{profile:'Bunga',attempts:[...attempts,{...base,contentVersion:candidate.contentVersion}]},mode).has(candidate.id)).toBe(true);
  }
 });
});
