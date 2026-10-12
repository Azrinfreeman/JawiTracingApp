import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/jim-family-straight-top-originals.json';
import {jimFamilyStraightTopReviewCandidates} from '../../src/content/reviewCandidates.js';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference,pointAt} from '../../src/tracing/geometry.js';
import {numberedGuidePlan} from '../../src/tracing/numberedGuides.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {createMatcher} from '../../src/tracing/matcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {teachingSections,demonstrationPlan,stageInstruction} from '../../src/tracing/teachingCues.js';

const proposals=jimFamilyStraightTopReviewCandidates(originals);
const refsFor=letter=>Object.fromEntries(letter.geometry.strokes.map(s=>[s.id,makeReference(samplePath(s.path,.2))]));
const engineFor=(letter,mode,type='mouse')=>(mode==='play'?createPlayMatcher:createMatcher)(letter,refsFor(letter),getProfile(mode,type));
const trace=(engine,route)=>{engine.start(route[0]);for(const p of route.slice(1))engine.move(p);return engine.end(route.at(-1));};

describe('Jim family straight left-to-right tops',()=>{
 it('changes only the four head paths and their geometry revisions',()=>{
  expect(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion])).toEqual([['jim',5],['ca',4],['ha-pedat',4],['kha',4]]);
  const before=JSON.stringify(originals);
  for(const {original,candidate}of proposals){
   const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;
   restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
   restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths[0]=original.geometry.displayPaths[0];
   expect(restored).toEqual(original);
   expect(candidate.geometry.strokes[0].path).toBe(candidate.geometry.displayPaths[0]);
  }
  expect(JSON.stringify(originals)).toBe(before);
 });
 it('is horizontal, joins the retained bowl and places 1/2/3 left to right, then 4 at the bowl',()=>{
  for(const {candidate}of proposals){
   const refs=refsFor(candidate),head=refs['stroke-1'],points=Array.from({length:21},(_,i)=>pointAt(head,head.length*i/20));
   expect(head.length).toBeCloseTo(333.3,5);
   for(let i=1;i<points.length;i++){expect(points[i].x).toBeGreaterThan(points[i-1].x);expect(points[i].y).toBeCloseTo(points[0].y,7);}
   const bowl=pointAt(refs['stroke-2'],0);expect(bowl.y).toBeCloseTo(points[0].y,7);
   expect(bowl.x).toBeGreaterThan(points[0].x);expect(bowl.x).toBeLessThan(points.at(-1).x);
   const plan=numberedGuidePlan(candidate,refs);
   expect(plan[0].points.map(p=>[p.number,p.label])).toEqual([[1,'Mula'],[2,'Ikut'],[3,'Henti']]);
   expect(plan[0].points.map(p=>p.anchor.x)).toEqual([377.6,544.25,710.9]);
   expect(plan[1].points[0]).toMatchObject({number:4,anchor:bowl});
  }
 });
 it('keeps proposals adult-only, rejects stale approvals and expires mismatched bases',()=>{
  const before=JSON.stringify(letters);
  for(const {original,candidate}of proposals){
   expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
   expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);
   const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;
   expect(validateLetter(stale).valid).toBe(false);
  }
  expect(jimFamilyStraightTopReviewCandidates(proposals.map(p=>p.candidate))).toEqual([]);
  expect(jimFamilyStraightTopReviewCandidates([])).toEqual([]);
  expect(jimFamilyStraightTopReviewCandidates(letters)).toEqual([]);expect(JSON.stringify(letters)).toBe(before);
 });
 it('promotes the exact reviewed models into student and challenge pools with matching owner approval',()=>{
  for(const {original,candidate}of proposals){
   const approved=letters.find(l=>l.id===candidate.id),restored=structuredClone(approved);
   expect(validateLetter(approved)).toMatchObject({valid:true,ready:true});
   expect(approved.geometry.review).toEqual({revision:candidate.contentVersion,reviewer:'Project owner (Codex user; name not supplied)',date:'2026-10-11',reference:'docs/CONTENT_APPROVALS.md#approval-of-jim-ca-ha-and-kha-straight-tops-2026-10-11',kind:'projectOwner'});
   restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
   expect(approved.audio).toEqual(original.audio);expect(eligibleBook(letters)).toContain(approved);expect(eligiblePool(letters,'ready')).toContain(approved);
  }
 });
 it('cues and demonstrates the straight top, separate bowl and dots without changing historical cues',()=>{
  for(const {original,candidate}of proposals){
   const refs=refsFor(candidate),guides=numberedGuidePlan(candidate,refs);
   expect(stageInstruction(candidate,guides[0],{phase:'awaitingStart',completed:[],progress:{}})).toBe('Mula di 1. Tarik garis lurus ke kanan hingga 3.');
   expect(stageInstruction(candidate,guides[1],{phase:'awaitingStart',completed:['stroke-1'],progress:{}})).toBe('Angkat pen. Mula semula di 4. Ikut lengkung mangkuk hingga hujung.');
   expect(teachingSections(original,'stroke-1')).toEqual([]);
   const plan=demonstrationPlan(candidate,refs,null,{});expect(plan.map(s=>s.id)).toEqual(candidate.geometry.validSequences[0]);
   expect(plan[0]).toMatchObject({from:0,to:refs['stroke-1'].length,pause:450});expect(plan[1].from).toBe(0);
   const partial=demonstrationPlan(candidate,refs,'stroke-1',{'stroke-1':100},true);
   expect(partial).toHaveLength(1);expect(partial[0]).toMatchObject({from:100,to:refs['stroke-1'].length});
  }
 });
 it('completes every movement with dots last in all modes and pointer profiles',()=>{
  for(const {candidate}of proposals)for(const mode of ['play','guided','precision'])for(const type of ['mouse','touch','pen']){
   const engine=engineFor(candidate,mode,type);
   for(const stroke of candidate.geometry.strokes){
    const route=samplePath(stroke.path,4);engine.start(route[0]);for(const p of route.slice(1))engine.move(p);
    expect(engine.snapshot().completed).not.toContain(stroke.id);engine.end(route.at(-1));expect(engine.snapshot().completed).toContain(stroke.id);
   }
   if(candidate.geometry.dotTargets.length)expect(engine.snapshot().phase).not.toBe('complete');
   for(const dot of candidate.geometry.dotTargets)trace(engine,[dot]);
   expect(engine.snapshot().phase,`${candidate.id} ${mode} ${type}`).toBe('complete');
   expect(engine.snapshot().metrics.dotCount).toBe(candidate.geometry.dotTargets.length);
  }
 });
 it('rejects right-end starts, reversed tops and endpoint shortcuts, then accepts tracing after restart',()=>{
  for(const {candidate}of proposals)for(const mode of ['play','guided','precision']){
   const route=samplePath(candidate.geometry.strokes[0].path,4);
   for(const invalid of [[route.at(-1)],route.toReversed(),[route[0],route.at(-1)]]){
    const engine=engineFor(candidate,mode);trace(engine,invalid);expect(engine.snapshot().completed).toEqual([]);
    const restarted=engineFor(candidate,mode);trace(restarted,route);expect(restarted.snapshot().completed).toContain('stroke-1');
   }
  }
 });
 it('preserves older saves and excludes preview completions from student credit for new revisions',()=>{
  for(const {original,candidate}of proposals)for(const mode of ['play','guided','precision']){
   const approved=letters.find(l=>l.id===candidate.id);
   const base={profile:'Bunga',letterId:candidate.id,mode,outcome:{play:'playComplete',guided:'guidedComplete',precision:'precisionComplete'}[mode],geometryStatus:'approved',audioStatus:'approved',preview:false};
   const attempts=[{...base,contentVersion:original.contentVersion},{...base,contentVersion:candidate.contentVersion,geometryStatus:'pendingReview',preview:true}],saved=JSON.stringify(attempts);
   expect(completedBookLetters([approved],{profile:'Bunga',attempts},mode).has(candidate.id)).toBe(false);
   expect(JSON.stringify(attempts)).toBe(saved);
   expect(completedBookLetters([approved],{profile:'Bunga',attempts:[...attempts,{...base,contentVersion:candidate.contentVersion}]},mode).has(candidate.id)).toBe(true);
  }
 });
});
