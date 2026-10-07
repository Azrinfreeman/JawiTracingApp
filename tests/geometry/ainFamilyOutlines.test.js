import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import letters from '../../src/content/letters.json' with {type:'json'};
import originals from '../fixtures/ain-family-originals.json' with {type:'json'};
import videoOriginals from '../fixtures/video-review-originals.json' with {type:'json'};
import ngaAudioOriginal from '../fixtures/nga-audio-original.json' with {type:'json'};
import {completedBookLetters} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {ainFamilyReviewCandidates,videoReviewCandidates} from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook} from '../../src/game/bookNavigation.js';
import {outlineIllustrationParts} from '../../src/tracing/outlineAppearance.js';
const before=letters.map(letter=>originals.find(original=>original.id===letter.id)||videoOriginals.find(original=>original.id===letter.id)||letter);
const candidates=ainFamilyReviewCandidates(before);
describe('Ain-family catalogue outlines',()=>{
  it('promotes the exact reviewed outlines to student and challenge pools without crediting older or preview attempts',()=>{
    expect(ainFamilyReviewCandidates(letters)).toEqual([]);
    expect(videoReviewCandidates(letters)).toEqual([]);
    for(const {candidate}of candidates){
      const approved=letters.find(letter=>letter.id===candidate.id),expected=structuredClone(candidate);
      expected.geometry.status='approved';expected.geometry.review=approved.geometry.review;
      // Compare the outline-approval stage independently of Nga's later audio replacement.
      const geometryStage=structuredClone(approved);
      if(approved.id==='nga')geometryStage.audio=structuredClone(ngaAudioOriginal.audio);
      expect(geometryStage).toEqual(expected);expect(validateLetter(approved)).toMatchObject({valid:true,ready:true});
      expect(approved.geometry.review).toMatchObject({revision:4,date:'2026-10-06',kind:'projectOwner',reference:'docs/CONTENT_APPROVALS.md#approval-of-ain-ghain-and-nga-outlines-2026-10-06'});
      expect(eligibleBook(letters)).toContain(approved);expect(eligiblePool(letters,'ready')).toContain(approved);
    }
    const attempt=(letter,version,preview=false)=>({profile:'Bunga',letterId:letter.id,contentVersion:version,preview,mode:'play',outcome:'playComplete',geometryStatus:'approved',audioStatus:'approved'});
    for(const [version,preview,total]of [[3,false,0],[4,true,0],[4,false,3]])expect(completedBookLetters(letters,{profile:'Bunga',attempts:originals.map(letter=>attempt(letter,version,preview))},'play').size).toBe(total);
  });
  it('keeps three valid proposals outside approved student content',()=>{
    expect(candidates.map(p=>p.candidate.id)).toEqual(['ain','ghain','nga']);
    for(const {candidate}of candidates){expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});expect(candidate.geometry.review).toBeNull();}
    expect(eligibleBook(candidates.map(p=>p.candidate))).toHaveLength(0);
    expect(videoReviewCandidates(before)).toHaveLength(7);
  });
  for(const {original,candidate}of candidates)it(`${original.id}: removes the early turn while preserving head, lift, dots and audio`,()=>{
    expect(candidate.contentVersion).toBe(original.contentVersion+1);
    expect(candidate.geometry.strokes[0]).toEqual(original.geometry.strokes[0]);
    expect(candidate.geometry.strokes[1].path).not.toBe(original.geometry.strokes[1].path);
    expect(candidate.geometry.strokes[1].path).not.toContain('464.6');
    expect(candidate.geometry.strokes).toHaveLength(2);
    expect(candidate.geometry.validSequences).toEqual(original.geometry.validSequences);
    expect(candidate.geometry.dotTargets).toEqual(original.geometry.dotTargets);
    expect(candidate.audio).toEqual(original.audio);
    expect(candidate.geometry.appearance.parts.map(p=>p.id)).toEqual(original.geometry.validSequences[0]);
    expect(ainFamilyReviewCandidates([candidate])).toHaveLength(0);
  });
  it('uses the actual bundled catalogue font with uniform scale and bounded contour error',()=>{
    for(const {candidate}of candidates){
      const source=candidate.geometry.appearance.source;
      expect(source.glyph).toBe(candidate.glyph);expect(source.weight).toBe(400);
      expect(source.maxContourError).toBeLessThan(.35);
      expect(source.sha256).toBe(createHash('sha256').update(readFileSync(`node_modules/${source.font}`)).digest('hex'));
    }
  });
  it('renders a single unsplit body and independently gated dots, and rejects open body contours',()=>{
    for(const {candidate}of candidates){
      const parts=outlineIllustrationParts(candidate);
      expect(parts.map(part=>part.id)).toEqual(['body',...candidate.geometry.dotTargets.map(dot=>dot.id)]);
      expect(parts[0].contours).toEqual(candidate.geometry.appearance.bodyContours);
      const bad=structuredClone(candidate);bad.geometry.appearance.bodyContours=['M0 0 L10 10'];
      expect(validateLetter(bad).valid).toBe(false);
    }
  });
});
