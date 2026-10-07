import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import originals from '../fixtures/four-letter-originals.json';
import {fourLetterReviewCandidates,videoReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook,completedBookLetters} from '../../src/game/bookNavigation.js';
import {fitTraceViewport} from '../../src/game/screenLayout.js';
// Genuine pre-promotion entries retain the pending-candidate validation cases after approval.
const before=letters.map(letter=>originals.find(original=>original.id===letter.id)||letter);
const candidates=fourLetterReviewCandidates(before).filter(proposal=>originals.some(original=>original.id===proposal.original.id));
describe('catalogue outline proposals',()=>{
  it('isolates exactly four new revisions without changing routes, dots, sequences or audio',()=>{
    expect(candidates.map(p=>p.original.id)).toEqual(['dal','zal','ra','zai']);
    for(const {original,candidate} of candidates){
      expect(candidate.contentVersion).toBe(original.contentVersion+1);
      expect(candidate.geometry.status).toBe('pendingReview');expect(candidate.geometry.review).toBeNull();
      for(const field of ['strokes','dotTargets','displayPaths','validSequences'])expect(candidate.geometry[field]).toEqual(original.geometry[field]);
      expect(candidate.audio).toEqual(original.audio);expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
    }
    expect(eligibleBook([...before,...candidates.map(c=>c.candidate)]).filter(l=>originals.some(original=>original.id===l.id)&&l.geometry.appearance)).toHaveLength(0);
    expect(videoReviewCandidates(letters)).toHaveLength(0);
  });
  it('rejects unsafe, open, missing and discontinuous appearance data',()=>{
    const bad=edit=>{const c=structuredClone(candidates[0].candidate);edit(c.geometry.appearance);expect(validateLetter(c).valid).toBe(false);};
    bad(a=>a.parts[0].contours=['M0 0 L10 10']);bad(a=>a.parts[0].contours=['<script>']);
    bad(a=>a.parts[0].id='unknown');bad(a=>a.parts=[]);bad(a=>a.parts[0].segments[1].from+=10);
    bad(a=>a.source.sha256='invented');bad(a=>a.bounds.width=2000);bad(a=>a.source.glyph='ب');
    bad(a=>a.parts[0].contours=['M-100 0 L10 10 L0 10 Z']);
  });
  it('fits full contours and dots with stable uniform-scale clearance',()=>{
    for(const {candidate}of candidates){
      const references={'stroke-1':{vertices:[{x:500,y:400},{x:550,y:600}]}};
      const fit=fitTraceViewport(candidate,references,320,600),b=candidate.geometry.appearance.bounds;
      expect(fit.x).toBeLessThan(b.x);expect(fit.y).toBeLessThan(b.y);
      expect(fit.x+fit.width).toBeGreaterThan(b.x+b.width);expect(fit.y+fit.height).toBeGreaterThan(b.y+b.height);
      expect(fit.width/fit.height).toBeCloseTo(320/600);
    }
  });
  it('requires reviewed version provenance before marking a candidate approved',()=>{
    const c=structuredClone(candidates[0].candidate);c.geometry.status='approved';c.geometry.review=candidates[0].original.geometry.review;
    expect(validateLetter(c)).toMatchObject({valid:false,ready:false});
  });
  it('makes the exact reviewed revisions student-ready and hides obsolete proposals',()=>{
    expect(fourLetterReviewCandidates(letters).filter(proposal=>originals.some(original=>original.id===proposal.original.id))).toEqual([]);
    for(const {candidate}of candidates){
      const approved=letters.find(letter=>letter.id===candidate.id);
      expect(approved.contentVersion).toBe(candidate.contentVersion);
      expect(approved.geometry.appearance).toEqual(candidate.geometry.appearance);
      expect(approved.geometry.review).toMatchObject({revision:candidate.contentVersion,date:'2026-10-06',kind:'projectOwner'});
      expect(validateLetter(approved)).toMatchObject({valid:true,ready:true});
    }
  });
  it('preserves old attempt revisions without crediting them to the newly approved model',()=>{
    const attempts=originals.map(letter=>({profile:'Bunga',preview:false,letterId:letter.id,contentVersion:letter.contentVersion,
      geometryStatus:'approved',audioStatus:'approved',mode:'play',outcome:'playComplete'}));
    expect(completedBookLetters(letters,{profile:'Bunga',attempts},'play').size).toBe(0);
    const current=attempts.map(attempt=>({...attempt,contentVersion:letters.find(letter=>letter.id===attempt.letterId).contentVersion}));
    expect(completedBookLetters(letters,{profile:'Bunga',attempts:current},'play').size).toBe(4);
    expect(attempts.map(attempt=>attempt.contentVersion)).toEqual(originals.map(letter=>letter.contentVersion));
  });
});
