import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/ta-za-straight-pillar-originals.json';
import {taZaStraightPillarReviewCandidates} from '../../src/content/reviewCandidates.js';
import {samplePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference,pointAt,projectLocal} from '../../src/tracing/geometry.js';
import {numberedGuidePlan} from '../../src/tracing/numberedGuides.js';
import {createPlayMatcher} from '../../src/tracing/playMatcher.js';
import {createMatcher} from '../../src/tracing/matcher.js';
import {getProfile} from '../../src/tracing/profiles.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {teachingSections,demonstrationPlan,stageInstruction} from '../../src/tracing/teachingCues.js';

const proposals=taZaStraightPillarReviewCandidates(originals);
const refsFor=letter=>Object.fromEntries(letter.geometry.strokes.map(s=>[s.id,makeReference(samplePath(s.path,.2))]));
const engineFor=(letter,mode,type='mouse')=>(mode==='play'?createPlayMatcher:createMatcher)(letter,refsFor(letter),getProfile(mode,type));
const trace=(engine,route)=>{engine.start(route[0]);for(const p of route.slice(1))engine.move(p);return engine.end(route.at(-1));};

describe('Ta and Za straight downward pillars',()=>{
 it('changes only the reference body, pillar paths, appearance and revision, preserving the dot and audio',()=>{
  expect(proposals.map(p=>[p.candidate.id,p.candidate.contentVersion])).toEqual([['tho',9],['za',9]]);
  const before=JSON.stringify(originals);
  for(const {original,candidate}of proposals){
   const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;
   restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;
   restored.geometry.strokes[0].path=original.geometry.strokes[0].path;
   restored.geometry.displayPaths[0]=original.geometry.displayPaths[0];
   restored.geometry.strokes[1].path=original.geometry.strokes[1].path;
   restored.geometry.displayPaths[1]=original.geometry.displayPaths[1];
   delete restored.geometry.appearance;
   expect(restored).toEqual(original);
   expect(candidate.geometry.displayPaths[1]).toBe(candidate.geometry.strokes[1].path);
  }
  expect(proposals[0].candidate.geometry.strokes[1]).toEqual(proposals[1].candidate.geometry.strokes[1]);
  expect(JSON.stringify(originals)).toBe(before);
 });
 it('adapts the compact lower photo loop, its open counter, tapered tail and fine pillar silhouette',()=>{
  for(const {candidate}of proposals){
   const appearance=candidate.geometry.appearance;
   expect(appearance).toMatchObject({kind:'referenceOutline',baseRevision:8,source:{kind:'referencePhoto',image:'ta-za-photo-reference.png',method:'authoredVectorAdaptation'}});
   expect(appearance.parts.map(p=>p.id)).toEqual(candidate.geometry.validSequences[0]);
   const [body,pillar]=appearance.parts;
   expect(body.contours).toHaveLength(2); // Outer silhouette and the white loop counter.
   expect(body.bounds.y).toBeGreaterThan(430);expect(body.bounds.height).toBeLessThan(240);
   expect(pillar.bounds.width).toBeLessThan(candidate.geometry.strokes[1].width);
   expect(appearance.bodyContours).toHaveLength(2); // Union has no extra junction hole.
   expect(body.bounds.x).toBeLessThan(210); // Reference's pointed left tail, not a round cap.
   const route=samplePath(candidate.geometry.strokes[0].path,.5);
   expect(Math.min(...route.map(p=>p.y))).toBeGreaterThan(450);
   expect(candidate.geometry.strokes[0].path).toBe(candidate.geometry.displayPaths[0]);
  }
  expect(proposals[0].candidate.geometry.strokes[0]).toEqual(proposals[1].candidate.geometry.strokes[0]);
 });
 it('descends on one vertical line and joins the retained lower curve without a hooked foot',()=>{
  for(const {candidate}of proposals){
   const refs=refsFor(candidate),pillar=refs['stroke-2'];
   expect(pillar.length).toBeCloseTo(414.89486,5);
   const points=Array.from({length:21},(_,i)=>pointAt(pillar,pillar.length*i/20));
   expect(points[0]).toEqual({x:387.6,y:194.4});
   for(let i=1;i<points.length;i++){expect(points[i].x).toBeCloseTo(387.6,7);expect(points[i].y).toBeGreaterThan(points[i-1].y);}
   expect(projectLocal(points.at(-1),refs['stroke-1'],0,refs['stroke-1'].length).error).toBeLessThan(.01);
   const plan=numberedGuidePlan(candidate,refs);
   expect(plan[1].points.map(p=>[p.number,p.label])).toEqual([[4,'Mula'],[5,'Ikut'],[6,candidate.id==='tho'?'Siap':'Henti']]);
   expect(plan[1].points[1].anchor).toMatchObject({x:387.6});
   expect(plan[1].points[1].anchor.y).toBeCloseTo(401.84743,5);
   if(candidate.id==='za')expect(plan[2].points[0]).toMatchObject({number:7,anchor:{x:552,y:297},label:'Titik akhir'});
  }
 });
 it('keeps candidates adult-only, rejects stale review metadata and expires mismatched revisions',()=>{
  const before=JSON.stringify(letters);
  expect(taZaStraightPillarReviewCandidates(originals).map(p=>p.candidate)).toEqual(proposals.map(p=>p.candidate));
  for(const {original,candidate}of proposals){
   expect(validateLetter(original)).toMatchObject({valid:true,ready:true});
   expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
   expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);
   const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;
   expect(validateLetter(stale).valid).toBe(false);
  }
  expect(taZaStraightPillarReviewCandidates(proposals.map(p=>p.candidate))).toEqual([]);
  expect(taZaStraightPillarReviewCandidates([])).toEqual([]);expect(JSON.stringify(letters)).toBe(before);
 });
 it('activates the exact reviewed Ta 9 and Za 9 with matching owner approval and expires their proposals',()=>{
  expect(taZaStraightPillarReviewCandidates(letters)).toEqual([]);
  for(const {candidate}of proposals){const active=letters.find(letter=>letter.id===candidate.id),restored=structuredClone(active);
   restored.geometry.status='pendingReview';restored.geometry.review=null;expect(restored).toEqual(candidate);
   expect(active.geometry.review).toMatchObject({revision:9,date:'2026-10-12',kind:'projectOwner',reference:'docs/CONTENT_APPROVALS.md#approval-of-ta-and-za-photo-reference-shapes-2026-10-12'});
   expect(validateLetter(active)).toMatchObject({valid:true,ready:true});expect(eligibleBook(letters)).toContain(active);expect(eligiblePool(letters,'ready')).toContain(active);
  }
 });
 it('cues the downward pillar and demonstrates the reference body, lift and separate dot',()=>{
  for(const {original,candidate}of proposals){
   const refs=refsFor(candidate),guides=numberedGuidePlan(candidate,refs);
   expect(teachingSections(original,'stroke-2')).toEqual([]);
   expect(stageInstruction(candidate,guides[1],{phase:'awaitingStart',completed:['stroke-1'],progress:{}})).toBe('Angkat pen. Mula semula di 4. Mula di atas. Tarik satu garis lurus ke bawah hingga pangkal.');
   const plan=demonstrationPlan(candidate,refs,null,{});
   expect(plan.map(s=>s.id)).toEqual(candidate.geometry.validSequences[0]);
   expect(plan[1]).toMatchObject({from:0,to:refs['stroke-2'].length,pause:450});
   expect(demonstrationPlan(candidate,refs,'stroke-2',{'stroke-2':100},true)).toEqual([{...plan[1],from:100,duration:(refs['stroke-2'].length-100)*4}]);
  }
 });
 it('completes with a separate release per stroke and the dot last in every mode/pointer profile',()=>{
  for(const {candidate}of proposals)for(const mode of ['play','guided','precision'])for(const type of ['mouse','touch','pen']){
   const engine=engineFor(candidate,mode,type);
   for(const stroke of candidate.geometry.strokes){
    const route=samplePath(stroke.path,4);engine.start(route[0]);for(const p of route.slice(1))engine.move(p);
    expect(engine.snapshot().completed).not.toContain(stroke.id);engine.end(route.at(-1));
    expect(engine.snapshot().completed).toContain(stroke.id);
   }
   if(candidate.id==='za')expect(engine.snapshot().phase).not.toBe('complete');
   for(const dot of candidate.geometry.dotTargets)trace(engine,[dot]);
   expect(engine.snapshot().phase,`${candidate.id} ${mode} ${type}`).toBe('complete');
   expect(engine.snapshot().metrics.dotCount).toBe(candidate.geometry.dotTargets.length);
   const completed=engine.snapshot().completed;engine.end({x:387.6,y:609.29486});expect(engine.snapshot().completed).toEqual(completed);
  }
 });
 it('rejects bottom-first, reversed and endpoint-only shortcuts after completing the body',()=>{
  for(const {candidate}of proposals)for(const mode of ['play','guided','precision']){
   const pillar=samplePath(candidate.geometry.strokes[1].path,4),body=samplePath(candidate.geometry.strokes[0].path,4);
   for(const invalid of [[pillar.at(-1)],pillar.toReversed(),[pillar[0],pillar.at(-1)]]){
    const engine=engineFor(candidate,mode);trace(engine,body);trace(engine,invalid);
    expect(engine.snapshot().completed).toEqual(['stroke-1']);
   }
  }
 });
 it('recovers from an early lift and cancellation without crediting an untraced pillar',()=>{
  for(const {candidate}of proposals)for(const mode of ['play','guided','precision'])for(const cancel of [false,true]){
   const engine=engineFor(candidate,mode),route=samplePath(candidate.geometry.strokes[1].path,4),split=Math.floor(route.length*.4);
   trace(engine,samplePath(candidate.geometry.strokes[0].path,4));
   engine.start(route[0]);for(const p of route.slice(1,split))engine.move(p);
   if(cancel)engine.cancel();else engine.end(route[split-1]);
   expect(engine.snapshot().completed).toEqual(['stroke-1']);
   // Both engines retain an accepted frontier; resume from it using actual movement.
   const frontier=engine.snapshot().progress['stroke-2'],refs=refsFor(candidate);
   const rest=[pointAt(refs['stroke-2'],frontier),...route.filter(p=>p.y>194.4+frontier)];
   trace(engine,rest);expect(engine.snapshot().completed).toContain('stroke-2');
  }
 });
 it('keeps historical and preview attempts without granting new-revision student credit',()=>{
  for(const {original,candidate}of proposals){
   const base={profile:'Bunga',letterId:candidate.id,mode:'play',outcome:'playComplete',geometryStatus:'approved',audioStatus:'approved',preview:false};
   const attempts=[{...base,contentVersion:original.contentVersion},{...base,contentVersion:candidate.contentVersion,geometryStatus:'pendingReview',preview:true}],before=JSON.stringify(attempts);
   const future={...candidate,geometry:{...candidate.geometry,status:'approved'}};
   expect(completedBookLetters([future],{profile:'Bunga',attempts},'play').has(candidate.id)).toBe(false);
   expect(JSON.stringify(attempts)).toBe(before);
  }
 });
});
