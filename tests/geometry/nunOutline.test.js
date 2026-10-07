import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {describe,it,expect} from 'vitest';
import letters from '../../src/content/letters.json';
import nunOriginal from '../fixtures/nun-outline-original.json';
import * as factories from '../../src/content/reviewCandidates.js';
import {validateLetter} from '../../src/content/validateContent.js';
import {eligibleBook} from '../../src/game/bookNavigation.js';
import {eligiblePool} from '../../src/game/matchConfig.js';
import {outlineIllustrationParts} from '../../src/tracing/outlineAppearance.js';
const before=letters.map(letter=>letter.id==='nun'?nunOriginal:letter);
const [{original,candidate}]=factories.fourLetterReviewCandidates(before);

describe('Nun catalogue-outline review',()=>{
 it('isolates Nun 3 for adult review without replacing approved Nun 2 or its audio',()=>{
  const inventory=Object.fromEntries(Object.entries(factories).map(([name,factory])=>[name,factory(before).map(proposal=>proposal.candidate.id)]));
  // This historical check covers the six scopes present when Nun was proposed.
  for(const [name,ids]of Object.entries(inventory).filter(([name])=>!['haDirectionReviewCandidates','nyaTipReviewCandidates','sadDadReviewCandidates'].includes(name)))expect(ids).toEqual(name==='fourLetterReviewCandidates'?['nun']:[]);
  expect(original).toBe(nunOriginal);expect(original.contentVersion).toBe(2);
  expect(candidate).toMatchObject({id:'nun',contentVersion:3,geometry:{status:'pendingReview',review:null}});
  expect(validateLetter(candidate)).toMatchObject({valid:true,ready:false});
  expect(eligibleBook([candidate])).toEqual([]);expect(eligiblePool([candidate],'ready')).toEqual([]);
  expect(factories.fourLetterReviewCandidates([candidate])).toEqual([]);
 });
 it('preserves tracing route, direction, one-dot targets, audio and unrelated identity',()=>{
  const restored=structuredClone(candidate);restored.contentVersion=original.contentVersion;restored.geometry.status=original.geometry.status;restored.geometry.review=original.geometry.review;delete restored.geometry.appearance;
  expect(restored).toEqual(original);expect(candidate.geometry.validSequences).toEqual([['stroke-1','dot-1']]);
  expect(candidate.audio).toEqual(original.audio);
 });
 it('uses Nun’s exact bundled catalogue font for both the bowl and diamond dot',()=>{
  const appearance=candidate.geometry.appearance,source=appearance.source;
  expect(source).toMatchObject({glyph:'ن',weight:400,fontSize:2400,method:'highResolutionInkContours'});
  expect(source.sha256).toBe(createHash('sha256').update(readFileSync(`node_modules/${source.font}`)).digest('hex'));
  expect(source.maxContourError).toBeLessThan(.35);
  expect(outlineIllustrationParts(candidate).map(part=>part.id)).toEqual(['stroke-1','dot-1']);
  expect(appearance.parts[0].segments.length).toBeGreaterThan(1);expect(appearance.parts[1].contours.every(path=>path.endsWith(' Z'))).toBe(true);
 });
 it('rejects the prior approval if a candidate is mistakenly marked approved',()=>{
  const stale=structuredClone(candidate);stale.geometry.status='approved';stale.geometry.review=original.geometry.review;
  expect(validateLetter(stale)).toMatchObject({valid:false,ready:false});
 });
});
