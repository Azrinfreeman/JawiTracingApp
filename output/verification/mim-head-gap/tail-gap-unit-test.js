import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import previous from '../fixtures/mim-video-original.json';
import {videoReviewCandidates} from '../../src/content/reviewCandidates.js';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {playGuideWidth} from '../../src/content/displayWidth.js';
const {candidate}=videoReviewCandidates(letters).find(p=>p.candidate.id==='mim');
describe('Mim small detached tail',()=>{
 it('keeps the closed loop exact and leaves a small gap even in the wider tracing guide',()=>{
  const [head,tail]=candidate.geometry.strokes;
  expect(head.path).toBe(previous.candidate.geometry.strokes[0].path.split(' C 437 611.1')[0]);
  const headPoints=samplePath(head.path,2),tailPoints=samplePath(tail.path,2);
  const distance=Math.min(...tailPoints.map(a=>Math.min(...headPoints.map(b=>Math.hypot(a.x-b.x,a.y-b.y)))));
  const gap=distance-(playGuideWidth(head)+playGuideWidth(tail))/2;
  expect(gap).toBeGreaterThan(15);expect(gap).toBeLessThan(25);
  expect(tailPoints.at(-1)).toEqual({x:436.4,y:843});
  const old=samplePath(previous.candidate.geometry.strokes[0].path,1);
  for(const point of tailPoints)expect(Math.min(...old.map(p=>Math.hypot(p.x-point.x,p.y-point.y)))).toBeLessThan(1);
 });
 it('requires a fresh revision and keeps the current student model and approved audio',()=>{
  expect(candidate.contentVersion).toBe(4);expect(candidate.geometry).toMatchObject({status:'pendingReview',review:null,validSequences:[['stroke-1','stroke-2']],dotTargets:[]});
  expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
  expect(letters.find(l=>l.id==='mim')).toEqual(previous.original);expect(candidate.audio).toEqual(previous.original.audio);
  const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review={...previous.original.geometry.review,revision:3};
  expect(validateLetter(stale)).toMatchObject({valid:false,ready:false});
 });
 it('cannot skip the head or bridge into the tail without lifting, and completes both parts on touch and pen',()=>{
  const refs=Object.fromEntries(candidate.geometry.strokes.map(s=>[s.id,makeReference(samplePath(s.path,2))]));
  for(const input of ['touch','pen']){
   const engine=createPlayMatcher(candidate,refs,getProfile('play',input));
   const head=samplePath(candidate.geometry.strokes[0].path,4),tail=samplePath(candidate.geometry.strokes[1].path,4);
   engine.start(tail[0]);for(const p of tail.slice(1))engine.move(p);engine.end(tail.at(-1));expect(engine.snapshot().phase).not.toBe('complete');
   engine.start(head[0]);for(const p of head.slice(1))engine.move(p);
   for(const p of tail)engine.move(p);engine.end(tail.at(-1));expect(engine.snapshot().completed).not.toContain('stroke-2');
   engine.start(tail[0]);for(const p of tail.slice(1))engine.move(p);engine.end(tail.at(-1));expect(engine.snapshot().phase).toBe('complete');
  }
 });
});
