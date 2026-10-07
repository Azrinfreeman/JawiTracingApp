import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/sad-dad-originals.json';
import {sadDadReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
// Preserve the preceding adult-review stage after promotion.
const proposals=sadDadReviewCandidates(originals);
describe('Sad and Dad catalogue outline proposals',()=>{
 it('preserves approved student entries and recordings while gating revision 3',()=>{
  expect(proposals.map(p=>p.candidate.id)).toEqual(['sad','dad']);
  for(const {original,candidate}of proposals){
   expect(original).toEqual(originals.find(l=>l.id===original.id));expect(candidate.audio).toEqual(original.audio);
   expect(candidate).toMatchObject({contentVersion:3,geometry:{status:'pendingReview',review:null}});
   expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);
   expect(sadDadReviewCandidates([candidate])).toEqual([]);
   const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;expect(validateLetter(stale).valid).toBe(false);
   expect(candidate.geometry.validSequences).toEqual(original.geometry.validSequences);
  }
 });
 it('uses the bundled catalogue font with complete head/bowl reveal partitions',()=>{
  for(const {candidate}of proposals){
   const a=candidate.geometry.appearance;expect(a.source.glyph).toBe(candidate.glyph);expect(a.source.maxContourError).toBeLessThan(.35);
   expect(a.source.sha256).toBe(createHash('sha256').update(readFileSync(`node_modules/${a.source.font}`)).digest('hex'));
   expect(a.parts.map(p=>p.id)).toEqual(candidate.geometry.validSequences[0]);expect(a.bodyContours.length).toBeGreaterThan(0);
   for(const p of a.parts.slice(0,2)){expect(p.segments[0].from).toBe(0);expect(p.segments.length).toBeGreaterThan(1);}
  }
 });
 it('accepts each full route with a pen lift and Dad dot last for mouse, touch and pen',()=>{
  for(const {candidate}of proposals)for(const type of ['mouse','touch','pen']){
   const references=Object.fromEntries(candidate.geometry.strokes.map(s=>[s.id,makeReference(samplePath(s.path,1))])),engine=createPlayMatcher(candidate,references,getProfile('play',type));
   if(candidate.geometry.dotTargets.length){const d=candidate.geometry.dotTargets[0];engine.start(d);engine.end(d);expect(engine.snapshot().phase).not.toBe('complete');}
   for(const s of candidate.geometry.strokes){const pts=samplePath(s.path,4);engine.start(pts[0]);for(const p of pts.slice(1))engine.move(p);engine.end(pts.at(-1));}
   if(candidate.geometry.dotTargets.length){expect(engine.snapshot().phase).not.toBe('complete');for(const d of candidate.geometry.dotTargets){engine.start(d);engine.end(d);}}
   expect(engine.snapshot().phase,`${candidate.id} ${type}`).toBe('complete');
  }
 });
 it('rejects bowl first and reversal',()=>{
  for(const {candidate}of proposals)for(const route of [samplePath(candidate.geometry.strokes[1].path,4),samplePath(candidate.geometry.strokes[0].path,4).reverse()]){
   const refs=Object.fromEntries(candidate.geometry.strokes.map(s=>[s.id,makeReference(samplePath(s.path,1))])),engine=createPlayMatcher(candidate,refs,getProfile('play','touch'));engine.start(route[0]);for(const p of route.slice(1))engine.move(p);engine.end(route.at(-1));expect(engine.snapshot().completed).not.toContain('stroke-1');
  }
 });
});
