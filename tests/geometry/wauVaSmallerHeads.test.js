import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/wau-va-smaller-head-originals.json';
import corrections from '../../src/content/wauVaSmallerHeads.json';
import {wauVaSmallerHeadReviewCandidates} from '../../src/content/reviewCandidates.js';
import {samplePath,parsePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference,pointAt} from '../../src/tracing/geometry.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {createMatcher} from '../../src/tracing/matcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {teachingSections,demonstrationPlan,stageInstruction} from '../../src/tracing/teachingCues.js';
import {numberedGuidePlan,placeNumberedGuides} from '../../src/tracing/numberedGuides.js';
import {fitTraceViewport} from '../../src/game/screenLayout.js';
import {usesModelGlyph} from '../../src/components/LetterModelGlyph.jsx';
const proposals=wauVaSmallerHeadReviewCandidates(originals);
const refs=l=>({'stroke-1':makeReference(samplePath(l.geometry.strokes[0].path,.1))});
const engine=(l,mode='play',type='mouse')=>(mode==='play'?createPlayMatcher:createMatcher)(l,refs(l),getProfile(mode,type));
function draw(e,route){e.start(route[0]);for(const p of route.slice(1))e.move(p);return e.end(route.at(-1));}
describe('Wau and Va modestly smaller head loops',()=>{
 it('changes only head paths and revisions while keeping active content, tails, dots and audio exact',()=>{
  expect(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion])).toEqual([['wau',4],['va',5]]);
  for(const {original,candidate}of proposals){expect(original).toEqual(originals.find(l=>l.id===original.id));
   expect(parsePath(candidate.geometry.strokes[0].path).slice(3)).toEqual(parsePath(original.geometry.strokes[0].path).slice(3));
   const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
   restored.geometry.strokes[0].path=original.geometry.strokes[0].path;restored.geometry.displayPaths=original.geometry.displayPaths;expect(restored).toEqual(original);
   expect(candidate.geometry.displayPaths).toEqual([candidate.geometry.strokes[0].path]);expect(candidate.geometry.strokes).toHaveLength(1);
  }
 });
 it('reduces both rendered head dimensions by 15–20 percent with unchanged stroke widths and fixed junctions',()=>{
  for(const {original,candidate}of proposals){const correction=corrections[candidate.id],width=candidate.geometry.strokes[0].displayWidth;
   for(const field of ['width','height']){const ratio=1-(correction.headBounds.after[field]+width)/(correction.headBounds.before[field]+width);expect(ratio).toBeGreaterThan(.15);expect(ratio).toBeLessThan(.2);}
   const before=parsePath(original.geometry.strokes[0].path),after=parsePath(candidate.geometry.strokes[0].path);
   expect(after[0][0]).toEqual(before[0][0]);expect(after[2].at(-1)).toEqual(before[2].at(-1));
   expect(candidate.geometry.strokes[0].width).toBe(44);expect(width).toBe(50);
  }expect(corrections.wau.headScale).toBe(corrections.va.headScale);
 });
 it('gates pending shapes, expires stale proposals, and rejects reused approval metadata',()=>{
  for(const {original,candidate}of proposals){expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);
   const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;expect(validateLetter(stale).valid).toBe(false);
   expect(wauVaSmallerHeadReviewCandidates([candidate])).toEqual([]);
  }
  expect(eligibleBook(letters)).toHaveLength(36);expect(letters.filter(l=>['tho','za'].includes(l.id)).map(l=>l.contentVersion)).toEqual([9,9]);
 });
 it('keeps preceding screen scale and framing while revised glyph selection applies only to the new revisions',()=>{
  for(const {original,candidate}of proposals){expect(usesModelGlyph(original)).toBe(false);expect(usesModelGlyph(candidate)).toBe(true);
   for(const [w,h]of [[320,740],[768,1024],[1024,768],[1,1]]){const before=fitTraceViewport(original,refs(original),w,h),after=fitTraceViewport(candidate,refs(candidate),w,h);
    for(const field of ['x','y','width','height'])expect(after[field]).toBeCloseTo(before[field],1);
   }
  }expect(usesModelGlyph(letters.find(l=>l.id==='alif'))).toBe(false);
 });
 it('recomputes the head/tail cue boundary and keeps numbering and demonstrations on the real continuous route',()=>{
  for(const {candidate}of proposals){const reference=refs(candidate),correction=corrections[candidate.id],guides=numberedGuidePlan(candidate,reference),parts=teachingSections(candidate,'stroke-1');
   expect(parts[1][0]).toBeLessThan(.6131);expect(parts[1][0]*reference['stroke-1'].length).toBeCloseTo(makeReference(samplePath(correction.headPath,.1)).length,2);
   expect(stageInstruction(candidate,guides[0],{phase:'awaitingStart',completed:[],progress:{}})).toBe('Mula di 1. Ke kiri, kemudian naik mengikut gelung.');
   expect(guides[0].points.map(p=>[p.number,p.label])).toEqual([[1,'Mula'],[2,'Ikut'],[3,candidate.id==='wau'?'Siap':'Henti']]);
   if(candidate.id==='va')expect(guides[1].points[0]).toMatchObject({number:4,label:'Titik akhir',anchor:{x:528,y:315}});
   const plan=demonstrationPlan(candidate,reference,null,{});expect(plan.map(p=>p.id)).toEqual(candidate.geometry.validSequences[0].flatMap(id=>id==='stroke-1'?[id,id]:[id]));
   expect(plan[0].to).toBe(plan[1].from);expect(plan[1].to).toBe(reference['stroke-1'].length);
  }
 });
 it('detaches nearby start/midpoint badges without changing their path anchors or unrelated guide placement',()=>{
  for(const {original,candidate}of proposals){const reference=refs(candidate),part=numberedGuidePlan(candidate,reference)[0];
   for(const [w,h]of [[320,740],[768,1024],[1024,768]]){const viewport=fitTraceViewport(candidate,reference,w,h),placed=placeNumberedGuides(part,candidate,reference,w/viewport.width,viewport);
    expect(placed.every(p=>p.detached)).toBe(true);expect(placed.map(p=>p.anchor)).toEqual(part.points.map(p=>p.anchor));
    for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++){const a=placed[i].occupiedBounds,b=placed[j].occupiedBounds;expect(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y).toBe(false);}
   }
   const oldRefs=refs(original),oldPart=numberedGuidePlan(original,oldRefs)[0];expect(placeNumberedGuides(oldPart,original,oldRefs,1).some(p=>p.detached)).toBe(false);
  }
 });
 it.each(['play','guided','precision'])('completes %s with mouse/touch/pen and a separate final Va dot',mode=>{
  for(const {candidate}of proposals)for(const type of ['mouse','touch','pen']){const e=engine(candidate,mode,type);draw(e,samplePath(candidate.geometry.strokes[0].path,4));expect(e.snapshot().completed).toContain('stroke-1');
   for(const dot of candidate.geometry.dotTargets){expect(e.snapshot().phase).not.toBe('complete');draw(e,[dot]);}expect(e.snapshot().phase).toBe('complete');
  }
 });
 it('rejects reversal and jumps and recovers from an early lift or cancellation on the smaller head',()=>{
  for(const {candidate}of proposals)for(const mode of ['play','guided','precision']){const route=samplePath(candidate.geometry.strokes[0].path,4);
   for(const invalid of [route.toReversed(),[route[0],route.at(-1)],route.slice(-15)]){const e=engine(candidate,mode);draw(e,invalid);expect(e.snapshot().completed).not.toContain('stroke-1');}
   for(const cancel of [false,true]){const e=engine(candidate,mode),split=Math.floor(route.length*.2);e.start(route[0]);for(const p of route.slice(1,split))e.move(p);if(cancel)e.cancel();else e.end(route[split-1]);
    expect(e.snapshot().completed).not.toContain('stroke-1');const frontier=e.snapshot().progress['stroke-1'],reference=refs(candidate)['stroke-1'];
    const count=Math.ceil((reference.length-frontier)/4);
    draw(e,Array.from({length:count+1},(_,i)=>pointAt(reference,frontier+(reference.length-frontier)*i/count)));
    expect(e.snapshot().completed).toContain('stroke-1');
   }
  }
 });
 it('preserves historical/preview attempts without crediting the new shape as student work',()=>{
  for(const {original,candidate}of proposals){const base={profile:'Bunga',letterId:candidate.id,mode:'play',outcome:'playComplete',geometryStatus:'approved',audioStatus:'approved',preview:false};
   const attempts=[{...base,contentVersion:original.contentVersion},{...base,contentVersion:candidate.contentVersion,preview:true,geometryStatus:'pendingReview'}],before=JSON.stringify(attempts);
   expect(completedBookLetters([candidate],{profile:'Bunga',attempts},'play').has(candidate.id)).toBe(false);expect(JSON.stringify(attempts)).toBe(before);
  }
 });
 it('activates the exact reviewed models with revision-matched owner approval and expires their proposals',()=>{
  expect(wauVaSmallerHeadReviewCandidates(letters)).toEqual([]);
  for(const {candidate}of proposals){const active=letters.find(l=>l.id===candidate.id),restored=structuredClone(active);restored.geometry.status='pendingReview';restored.geometry.review=null;
   expect(restored).toEqual(candidate);expect(active.geometry.review).toMatchObject({revision:candidate.contentVersion,date:'2026-10-12',kind:'projectOwner',reference:'docs/CONTENT_APPROVALS.md#approval-of-wau-and-va-smaller-heads-2026-10-12'});
   expect(validateLetter(active)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(active);expect(eligiblePool(letters,'ready')).toContain(active);
  }
 });
});
