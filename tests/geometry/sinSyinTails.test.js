import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/sin-syin-tail-originals.json';
import {sinSyinTailReviewCandidates,videoReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {samplePath,parsePath} from '../../scripts/lib/glyph-geometry.mjs';
import {makeReference} from '../../src/tracing/geometry.js';
import {numberedGuidePlan} from '../../src/tracing/numberedGuides.js';
const reviewBase=letters.map(letter=>originals.find(original=>original.id===letter.id)||letter);
const candidates=sinSyinTailReviewCandidates(reviewBase);
describe('Sin and Syin modest tail lift',()=>{
  it('raises both tips equally while keeping them below the other peaks and preserving the bowl and movement order',()=>{
    expect(candidates.map(proposal=>proposal.candidate.id)).toEqual(['sin','syin']);
    for(const {original,candidate}of candidates){
      const before=parsePath(original.geometry.strokes[0].path),after=parsePath(candidate.geometry.strokes[0].path);
      expect(after.slice(0,-1)).toEqual(before.slice(0,-1));
      expect(after.at(-1).slice(0,-1)).toEqual(before.at(-1).slice(0,-1));
      const oldTip=before.at(-1).at(-1),tip=after.at(-1).at(-1);
      expect(tip).toEqual({x:oldTip.x,y:oldTip.y-40});
      expect(tip.y-after[3].at(-1).y).toBe(95);
      expect(tip.y).toBeGreaterThan(after[1].at(-1).y);
      expect(candidate.geometry.displayPaths).toEqual(candidate.geometry.strokes.map(stroke=>stroke.path));
      const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;
      restored.geometry.review=original.geometry.review;restored.geometry.strokes[0].path=original.geometry.strokes[0].path;
      restored.geometry.displayPaths=original.geometry.displayPaths;expect(restored).toEqual(original);
    }
    expect(candidates[0].candidate.geometry.strokes[0].path).toBe(candidates[1].candidate.geometry.strokes[0].path);
  });
  it('moves the finish anchor with the actual route and retains numbering and all three Syin dots',()=>{
    for(const {original,candidate}of candidates){
      const refs=letter=>Object.fromEntries(letter.geometry.strokes.map(stroke=>[stroke.id,makeReference(samplePath(stroke.path,2))]));
      const plan=numberedGuidePlan(candidate,refs(candidate)),old=numberedGuidePlan(original,refs(original));
      expect(plan.map(part=>part.points.map(point=>point.number))).toEqual(old.map(part=>part.points.map(point=>point.number)));
      expect(plan[0].points.at(-1).anchor).toEqual({x:185,y:510});
      expect(plan[0].points.at(-1).anchor.y).toBe(old[0].points.at(-1).anchor.y-40);
      expect(candidate.geometry.dotTargets).toEqual(original.geometry.dotTargets);
      expect(candidate.geometry.validSequences).toEqual(original.geometry.validSequences);
    }
    expect(candidates.map(({candidate})=>candidate.geometry.dotTargets.length)).toEqual([0,3]);
  });
  it('requires fresh geometry approval and cannot enter student or challenge pools',()=>{
    for(const {original,candidate}of candidates){
      expect(candidate.contentVersion).toBe(original.contentVersion+1);
      expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
      expect(candidate.geometry).toMatchObject({status:'pendingReview',review:null});
      const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;
      expect(validateLetter(stale)).toMatchObject({valid:false,ready:false});
      expect(original).toEqual(originals.find(letter=>letter.id===original.id));
    }
    const models=candidates.map(proposal=>proposal.candidate);
    expect(eligibleBook(models)).toEqual([]);expect(eligibleBook(models,true)).toHaveLength(2);expect(eligiblePool(models,'ready')).toEqual([]);
    expect(videoReviewCandidates(letters)).toHaveLength(0);
  });
  it('does not offer stale tail changes after the source revisions change',()=>{
    const revised=letters.map(letter=>['sin','syin'].includes(letter.id)?{...letter,contentVersion:letter.contentVersion+1}:letter);
    expect(sinSyinTailReviewCandidates(revised)).toEqual([]);
  });
  it('promotes exactly the reviewed geometry and isolates old and preview completions',()=>{
    expect(sinSyinTailReviewCandidates(letters)).toEqual([]);
    for(const {original,candidate}of candidates){
      const approved=letters.find(letter=>letter.id===candidate.id);
      expect(validateLetter(approved)).toMatchObject({valid:true,ready:true});
      expect(approved.geometry.review).toMatchObject({revision:candidate.contentVersion,kind:'projectOwner',date:'2026-10-06'});
      const restored=structuredClone(approved);restored.geometry.status=candidate.geometry.status;restored.geometry.review=candidate.geometry.review;
      expect(restored).toEqual(candidate);
      const record={profile:'Bunga',letterId:approved.id,mode:'play',outcome:'playComplete',preview:false,geometryStatus:'approved',audioStatus:'approved'};
      const old={...record,contentVersion:original.contentVersion};
      const preview={...record,contentVersion:approved.contentVersion,preview:true};
      expect(completedBookLetters(letters,{profile:'Bunga',attempts:[old,preview]},'play').has(approved.id)).toBe(false);
      expect(completedBookLetters(letters,{profile:'Bunga',attempts:[old,preview,{...record,contentVersion:approved.contentVersion}]},'play').has(approved.id)).toBe(true);
    }
  });
});
