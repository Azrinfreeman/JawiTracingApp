import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/ta-za-originals.json';
import {taZaStemReviewCandidates} from '../../src/content/reviewCandidates.js';
import {parsePath,samplePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference} from '../../src/tracing/geometry.js';
import {numberedGuidePlan} from '../../src/tracing/numberedGuides.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
const proposals=taZaStemReviewCandidates(letters.map(letter=>originals.find(original=>original.id===letter.id)||letter));
const refs=letter=>Object.fromEntries(letter.geometry.strokes.map(s=>[s.id,makeReference(samplePath(s.path,1))]));
describe('Ta and Za tall stroke closer to the left tail',()=>{
 it('moves the tall stem left equally and keeps both joins connected without a foot protruding below the tail',()=>{
  expect(proposals.map(p=>p.candidate.id)).toEqual(['tho','za']);
  for(const {original,candidate}of proposals){
   const before=parsePath(original.geometry.strokes[1].path),after=parsePath(candidate.geometry.strokes[1].path);
   const shifted=before.map(segment=>segment.map(value=>typeof value==='object'?{x:value.x-60,y:value.y}:value));
   expect(after).toEqual(shifted);
   const body=samplePath(candidate.geometry.strokes[0].path,1),foot=samplePath(candidate.geometry.strokes[1].path,1).at(-1);
   expect(Math.min(...body.map(p=>Math.hypot(p.x-foot.x,p.y-foot.y)))).toBeLessThan(1);
   expect(Math.min(...samplePath(candidate.geometry.strokes[1].path,1).map(p=>Math.hypot(p.x-body[0].x,p.y-body[0].y)))).toBeLessThan(5);
   expect(foot.x-body.at(-1).x).toBeCloseTo(47.9,5);
   const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
   restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.strokes[1].path=original.geometry.strokes[1].path;restored.geometry.displayPaths=original.geometry.displayPaths;restored.geometry.dotTargets=original.geometry.dotTargets;expect(restored).toEqual(original);
  }
  expect(proposals[0].candidate.geometry.strokes[1]).toEqual(proposals[1].candidate.geometry.strokes[1]);
 });
 it('copies the original 3 head and loop exactly without stretching, scaling or an added flat connector',()=>{
  for(const {original,candidate}of proposals){
   const before=parsePath(original.geometry.strokes[0].path),after=parsePath(candidate.geometry.strokes[0].path);
   expect(after).toHaveLength(5);expect(candidate.geometry.strokes[0].path).not.toMatch(/\bL\b/);
   expect(after.slice(0,4)).toEqual(before.slice(0,4).map(segment=>segment.map(p=>({x:+(p.x-60).toFixed(1),y:p.y}))));
   expect(after.at(-1).at(-1)).toEqual(before.at(-1).at(-1));
   const entering={x:after[3][3].x-after[3][2].x,y:after[3][3].y-after[3][2].y};
   const exit={x:after[4][1].x-after[4][0].x,y:after[4][1].y-after[4][0].y};
   expect(entering).toEqual({x:before[3][3].x-before[3][2].x,y:before[3][3].y-before[3][2].y});
   expect(exit.x).toBeCloseTo(before[4][1].x-before[4][0].x,5);expect(exit.y).toBe(before[4][1].y-before[4][0].y);
  }
 });
 it('keeps tail number 3 and writing order, and moves the stem cues with the actual route',()=>{
  for(const {original,candidate}of proposals){
   const before=numberedGuidePlan(original,refs(original)),after=numberedGuidePlan(candidate,refs(candidate));
   expect(after[0].points.map(p=>p.number)).toEqual(before[0].points.map(p=>p.number));expect(after[0].points.at(-1)).toEqual(before[0].points.at(-1));expect(after[0].points.at(-1)).toMatchObject({number:3,anchor:{x:310,y:575}});
   expect(after[0].points[0].anchor).toEqual({x:405.2,y:517.8});
   for(let i=0;i<after[1].points.length;i++){
    expect(after[1].points[i].number).toBe(before[1].points[i].number);
    expect(after[1].points[i].anchor.x).toBeCloseTo(before[1].points[i].anchor.x-60,5);expect(after[1].points[i].anchor.y).toBeCloseTo(before[1].points[i].anchor.y,5);
   }
   expect(candidate.geometry.dotTargets).toEqual(original.geometry.dotTargets.map(dot=>({...dot,x:dot.x-60})));expect(candidate.geometry.validSequences).toEqual(original.geometry.validSequences);
  }
 });
 it('requires fresh review, preserves approved students/audio, and expires against a later revision',()=>{
  for(const {original,candidate}of proposals){
   expect(candidate.contentVersion).toBe(6);expect(candidate.geometry).toMatchObject({status:'pendingReview',review:null});
   expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});expect(validateLetter(original)).toMatchObject({valid:true,ready:true});
   expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);expect(candidate.audio).toEqual(original.audio);
   expect(taZaStemReviewCandidates([candidate])).toEqual([]);
   const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;expect(validateLetter(stale).valid).toBe(false);
  }
 });
 it('accepts whole two-stroke touch/pen routes and retains the dot gate and rejection of drawing the stem first',()=>{
  for(const {candidate}of proposals)for(const type of ['touch','pen'])for(const spacing of [4,24,40]){
   const engine=createPlayMatcher(candidate,refs(candidate),getProfile('play',type));
   const stem=samplePath(candidate.geometry.strokes[1].path,spacing);engine.start(stem[0]);for(const p of stem.slice(1))engine.move(p);engine.end(stem.at(-1));expect(engine.snapshot().completed).toEqual([]);
   for(const stroke of candidate.geometry.strokes){const route=samplePath(stroke.path,spacing);engine.start(route[0]);for(const p of route.slice(1))engine.move(p);engine.end(route.at(-1));}
   if(candidate.geometry.dotTargets.length){expect(engine.snapshot().phase).not.toBe('complete');for(const dot of candidate.geometry.dotTargets){engine.start(dot);engine.end(dot);}}
   expect(engine.snapshot().phase,`${candidate.id} ${type} ${spacing}`).toBe('complete');
  }
 });
});
